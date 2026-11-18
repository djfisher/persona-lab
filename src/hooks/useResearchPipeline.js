import { useReducer, useRef, useCallback } from "react";
import { callAPI, extractJSON } from "../api/llm.js";
import { buildSystemPrompt, JTBD_PROMPT, STEELMAN_PROMPT, REWRITE_PROMPT } from "../prompts/index.js";

export const PHASES = {
  IDLE: "idle",
  RUNNING: "running",
  SYNTHESIZING: "synthesizing",
  STEELMANNING: "steelmanning",
  REWRITING: "rewriting",
  SAVING: "saving",
  COMPLETE: "complete",
};

const initialState = {
  phase: PHASES.IDLE,
  results: {},
  lastResults: null,
  personaLoading: {},
  personaErrors: {},
  synthesis: null,
  steelMan: null,
  rewrite: null,
  globalError: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return initialState;

    case "loadSnapshot":
      return {
        ...initialState,
        results: action.results ?? {},
        lastResults: action.results ?? null,
        synthesis: action.synthesis ?? null,
        steelMan: action.steelMan ?? null,
        rewrite: action.rewrite ?? null,
        phase: PHASES.COMPLETE,
      };

    case "fanoutStart": {
      const personaLoading = Object.fromEntries(action.personaIds.map(id => [id, true]));
      return { ...initialState, phase: PHASES.RUNNING, personaLoading };
    }

    case "personaSuccess":
      return {
        ...state,
        results: { ...state.results, [action.personaId]: action.result },
        personaLoading: { ...state.personaLoading, [action.personaId]: false },
      };

    case "personaError":
      return {
        ...state,
        personaLoading: { ...state.personaLoading, [action.personaId]: false },
        personaErrors: { ...state.personaErrors, [action.personaId]: action.error },
      };

    case "retryStart": {
      const nextErrors = { ...state.personaErrors };
      delete nextErrors[action.personaId];
      return {
        ...state,
        personaLoading: { ...state.personaLoading, [action.personaId]: true },
        personaErrors: nextErrors,
      };
    }

    case "retrySuccess":
      return {
        ...state,
        personaLoading: { ...state.personaLoading, [action.personaId]: false },
        results: { ...state.results, [action.personaId]: action.result },
        lastResults: { ...(state.lastResults ?? {}), [action.personaId]: action.result },
      };

    case "fanoutComplete":
      return { ...state, lastResults: action.allResults };

    case "phase":
      return { ...state, phase: action.phase };

    case "synthesisDone":
      return { ...state, synthesis: action.synthesis };
    case "steelManDone":
      return { ...state, steelMan: action.steelMan };
    case "rewriteDone":
      return { ...state, rewrite: action.rewrite };

    case "stop":
      return { ...state, phase: PHASES.IDLE, personaLoading: {} };

    case "error":
      return { ...state, globalError: action.error };
    case "clearError":
      return { ...state, globalError: null };

    default:
      return state;
  }
}

function summarizePersonaResults(personaResults, personas, mode) {
  return Object.entries(personaResults)
    .map(([pid, r]) => {
      const p = personas.find(pp => pp.id === pid);
      if (!p) return "";
      if (mode === "steelman") {
        return `${p.name}: ${r.headline}\nDealbreakers: ${(r.dealbreakers || []).join("; ")}\nBuy%: ${r.buyProbability}%\nCompetitor: ${r.competitorMention}`;
      }
      if (mode === "rewrite") {
        return `PERSONA: ${p.name} (${p.role})\nHeadline: ${r.headline}\nReview: ${r.review}\nDealbreakers: ${(r.dealbreakers || []).join("; ")}\nWishlist: ${(r.wishlist || []).join("; ")}\nUnsolved Pain Points: ${(r.unsolvedPainPoints || []).join("; ")}\nBuy%: ${r.buyProbability}%`;
      }
      return `PERSONA: ${p.name} (${p.role})\nRatings: Overall ${r.ratings.overall}, Value ${r.ratings.value}, Usability ${r.ratings.usability}, Reliability ${r.ratings.reliability}, Recommend ${r.ratings.wouldRecommend}\nBuy%: ${r.buyProbability}%\nHeadline: ${r.headline}\nReview: ${r.review}\nDealbreakers: ${(r.dealbreakers || []).join("; ")}\nCompetitor: ${r.competitorMention}\nWishlist: ${(r.wishlist || []).join("; ")}\nUnsolved Pain Points: ${(r.unsolvedPainPoints || []).join("; ")}`;
    })
    .filter(Boolean)
    .join(mode === "steelman" ? "\n---\n" : "\n\n---\n\n");
}

export function useResearchPipeline({
  personas,
  selectedIds,
  selectedModelId,
  cynicism,
  productName,
  productDesc,
  competitors,
  user,
  ensureProduct,
  saveRun,
  refreshRuns,
  onTabSwitch,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);

  const stopResearch = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    dispatch({ type: "stop" });
  }, []);

  const runStandalone = useCallback((fn) => {
    abortRef.current?.abort();
    const c = new AbortController();
    abortRef.current = c;
    return Promise.resolve(fn(c.signal)).finally(() => {
      if (abortRef.current === c) abortRef.current = null;
    });
  }, []);

  const runSynthesis = useCallback(async (personaResults, signal) => {
    dispatch({ type: "phase", phase: PHASES.SYNTHESIZING });
    dispatch({ type: "clearError" });
    try {
      const summary = summarizePersonaResults(personaResults, personas, "synthesis");
      const text = await callAPI({
        modelId: selectedModelId,
        system: JTBD_PROMPT,
        userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${competitors.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}\n\nAnalyze using JTBD with Four Forces and friction mapping.`,
        maxTokens: 6000,
        signal,
      });
      const data = extractJSON(text);
      dispatch({ type: "synthesisDone", synthesis: data });
      onTabSwitch?.("jtbd");
      return data;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      dispatch({ type: "error", error: { title: "JTBD Synthesis Failed", message: err.message, detail: err.message, retryable: true } });
    }
  }, [personas, selectedModelId, productName, productDesc, competitors, onTabSwitch]);

  const runSteelMan = useCallback(async (personaResults, signal) => {
    dispatch({ type: "phase", phase: PHASES.STEELMANNING });
    dispatch({ type: "clearError" });
    try {
      const summary = summarizePersonaResults(personaResults, personas, "steelman");
      const text = await callAPI({
        modelId: selectedModelId,
        system: STEELMAN_PROMPT,
        userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${competitors.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}`,
        maxTokens: 1500,
        signal,
      });
      const data = extractJSON(text);
      dispatch({ type: "steelManDone", steelMan: data });
      onTabSwitch?.("steelman");
      return data;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      dispatch({ type: "error", error: { title: "Pre-Mortem Failed", message: err.message, detail: err.message, retryable: true } });
    }
  }, [personas, selectedModelId, productName, productDesc, competitors, onTabSwitch]);

  const runRewrite = useCallback(async (personaResults, synthesisData, signal, guidance = "") => {
    dispatch({ type: "phase", phase: PHASES.REWRITING });
    try {
      const personaSummary = summarizePersonaResults(personaResults, personas, "rewrite");
      const jtbdSummary = synthesisData
        ? `EXECUTIVE SUMMARY: ${synthesisData.executiveSummary}\nFORCES: Push — ${synthesisData.forces?.push} | Pull — ${synthesisData.forces?.pull} | Anxiety — ${synthesisData.forces?.anxiety} | Habit — ${synthesisData.forces?.habit}\nTOP JOBS: ${(synthesisData.jobs || []).map(j => j.statement).join(" / ")}\nMARKET GAPS: ${(synthesisData.marketGaps || []).map(g => `${g.gap} (${g.demand} demand)`).join("; ")}`
        : "";
      const guidanceSection = guidance.trim() ? `\n\nADDITIONAL DIRECTION: ${guidance.trim()}` : "";
      const text = await callAPI({
        modelId: selectedModelId,
        system: REWRITE_PROMPT,
        userMessage: `ORIGINAL PRODUCT: ${productName}\nORIGINAL DESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${competitors.join(", ") || "Not specified"}\n\nPERSONA FEEDBACK:\n${personaSummary}\n\nJTBD SYNTHESIS:\n${jtbdSummary}${guidanceSection}\n\nRewrite the product offering based on all of this.`,
        maxTokens: 3000,
        signal,
      });
      const data = extractJSON(text);
      dispatch({ type: "rewriteDone", rewrite: data });
      onTabSwitch?.("rewrite");
      return data;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      dispatch({ type: "error", error: { title: "Product Rewrite Failed", message: err.message, detail: err.message, retryable: true } });
    }
  }, [personas, selectedModelId, productName, productDesc, competitors, onTabSwitch]);

  const retrySingle = useCallback(async (persona, signal) => {
    dispatch({ type: "retryStart", personaId: persona.id });
    try {
      const text = await callAPI({
        modelId: selectedModelId,
        system: buildSystemPrompt(persona, competitors, cynicism),
        userMessage: `Review this product:\n\nProduct: ${productName}\nDescription: ${productDesc || "No description."}\n${competitors.length ? `Known Competitors: ${competitors.join(", ")}` : ""}\n\nGive your honest assessment.`,
        signal,
      });
      const parsed = extractJSON(text);
      dispatch({ type: "retrySuccess", personaId: persona.id, result: parsed });
    } catch (err) {
      if (err.name === "AbortError") return;
      dispatch({ type: "personaError", personaId: persona.id, error: err.message });
    }
  }, [selectedModelId, productName, productDesc, competitors, cynicism]);

  const runResearch = useCallback(async () => {
    if (!productName.trim()) return;
    const sel = personas.filter(p => selectedIds.includes(p.id));
    if (!sel.length) return;

    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    dispatch({ type: "fanoutStart", personaIds: sel.map(p => p.id) });
    onTabSwitch?.("feedback");

    try {
      const settled = await Promise.allSettled(sel.map(async (persona) => {
        try {
          const text = await callAPI({
            modelId: selectedModelId,
            system: buildSystemPrompt(persona, competitors, cynicism),
            userMessage: `Review this product:\n\nProduct: ${productName}\nDescription: ${productDesc || "No description — evaluate from your knowledge."}\n${competitors.length ? `Known Competitors: ${competitors.join(", ")}` : ""}\n\nGive your honest assessment.`,
            thinking: true,
            signal,
          });
          const parsed = extractJSON(text);
          dispatch({ type: "personaSuccess", personaId: persona.id, result: parsed });
          return { id: persona.id, result: parsed };
        } catch (err) {
          if (err.name === "AbortError") {
            dispatch({ type: "personaError", personaId: persona.id, error: "Cancelled" });
          } else {
            dispatch({ type: "personaError", personaId: persona.id, error: err.message });
          }
          throw err;
        }
      }));

      if (signal.aborted) return;

      const allResults = {};
      settled.forEach(s => { if (s.status === "fulfilled") allResults[s.value.id] = s.value.result; });
      dispatch({ type: "fanoutComplete", allResults });

      if (Object.keys(allResults).length < 2) {
        dispatch({ type: "phase", phase: PHASES.COMPLETE });
        return;
      }

      const synthesisData = await runSynthesis(allResults, signal);
      const steelManResult = await runSteelMan(allResults, signal);
      const rewriteResult = await runRewrite(allResults, synthesisData, signal);

      if (signal.aborted || !user) {
        dispatch({ type: "phase", phase: PHASES.COMPLETE });
        return;
      }

      dispatch({ type: "phase", phase: PHASES.SAVING });
      try {
        const product = await ensureProduct?.({ name: productName, description: productDesc });
        if (product) {
          await saveRun?.({
            productId: product.id,
            cynicism,
            modelId: selectedModelId,
            competitors,
            selectedPersonaIds: selectedIds,
            results: allResults,
            synthesis: synthesisData ?? null,
            steelman: steelManResult ?? null,
            rewrite: rewriteResult ?? null,
          });
          refreshRuns?.();
        }
      } catch (err) {
        console.error("Failed to save run:", err);
        dispatch({ type: "error", error: { title: "Couldn't Save Run", message: err.message, retryable: false } });
      }

      dispatch({ type: "phase", phase: PHASES.COMPLETE });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({ type: "error", error: { title: "Research Failed", message: err.message, retryable: true } });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [
    personas, selectedIds, selectedModelId, cynicism,
    productName, productDesc, competitors,
    user, ensureProduct, saveRun, refreshRuns, onTabSwitch,
    runSynthesis, runSteelMan, runRewrite,
  ]);

  const loadSnapshot = useCallback((snapshot) => {
    dispatch({ type: "loadSnapshot", ...snapshot });
  }, []);

  const clearError = useCallback(() => dispatch({ type: "clearError" }), []);
  const setError = useCallback((error) => dispatch({ type: "error", error }), []);

  // Derived
  const anyLoad = Object.values(state.personaLoading).some(Boolean);
  const resultCount = Object.keys(state.results).length;
  const busy = state.phase !== PHASES.IDLE && state.phase !== PHASES.COMPLETE;

  return {
    // Phase + derived flags for UI (shaped to match prior App.jsx variables)
    phase: state.phase,
    synthesizing: state.phase === PHASES.SYNTHESIZING,
    steelManning: state.phase === PHASES.STEELMANNING,
    rewriting: state.phase === PHASES.REWRITING,
    saving: state.phase === PHASES.SAVING,
    busy,
    anyLoad,
    resultCount,

    // State
    results: state.results,
    lastResults: state.lastResults,
    loading: state.personaLoading,
    personaErrors: state.personaErrors,
    synthesis: state.synthesis,
    steelMan: state.steelMan,
    rewrite: state.rewrite,
    globalError: state.globalError,

    // Actions
    runResearch,
    runSynthesis,
    runSteelMan,
    runRewrite,
    retrySingle,
    stopResearch,
    runStandalone,
    loadSnapshot,
    clearError,
    setError,
  };
}
