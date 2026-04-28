import { useState, useRef } from "react";
import { downloadFeedbackPDF } from "./FeedbackPDF";
import { usePersonas } from "./personas/usePersonas";
import { buildSystemPrompt, JTBD_PROMPT, REWRITE_PROMPT, STEELMAN_PROMPT, PERSONA_GEN_PROMPT } from "./prompts/index.js";
import { MethodologyPanel, FeedbackPanel, SteelManPanel, JTBDPanel, RewritePanel, PersonaEditor, SettingsPanel } from "./components/panels/index.jsx";

import { callAPI, extractJSON, MODELS } from "./api/llm.js";
import { Card, SH, TabBtn, ErrorBanner, RATING_DIMS } from "./components/Common.jsx";

const CYNICISM_LABELS = { 1: "Generous", 2: "Fair", 3: "Skeptical", 4: "Harsh", 5: "Ruthless" };

// ─── PROMPTS ───
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const { personas, addPersona, updatePersona } = usePersonas();
  const [selectedIds, setSelectedIds] = useState(() => personas.map(p => p.id));
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [competitors, setCompetitors] = useState([""]);
  const [cynicism, setCynicism] = useState(3);
  const [results, setResults] = useState({});
  const [personaErrors, setPersonaErrors] = useState({});
  const [loading, setLoading] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const [view, setView] = useState("research");
  const [activeTab, setActiveTab] = useState("feedback");
  const [editPersona, setEditPersona] = useState(null);
  const [viewMethodology, setViewMethodology] = useState(null);
  const [synthesis, setSynthesis] = useState(null);
  const [steelMan, setSteelMan] = useState(null);
  const [rewrite, setRewrite] = useState(null);
  const [rewriteGuidance, setRewriteGuidance] = useState("");
  const [synthesizing, setSynthesizing] = useState(false);
  const [steelManning, setSteelManning] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genNiche, setGenNiche] = useState("");
  const [lastResults, setLastResults] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [newPersona, setNewPersona] = useState({ name: "", role: "", avatar: "🧑", color: "#8B5CF6", traits: { skepticism: 7, technicalDepth: 5, priceConscious: 7, easeOfUseWeight: 7, brandLoyalty: 3 }, backstory: "", averageRating: 4, petPeeves: [""], pedigree: { calibratedFrom: "", biasProfile: "", blindSpot: "" } });

  const abortRef = useRef(null);

  const stopResearch = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading({});
    setSynthesizing(false);
    setSteelManning(false);
    setRewriting(false);
  };

  const comps = competitors.filter(c => c.trim());
  const toggle = id => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const modelName = MODELS.find(m => m.id === selectedModelId)?.name || "Unknown Model";
    try {
      await downloadFeedbackPDF({ personas, results, synthesis, steelMan, rewrite, productName, productDesc, modelName });
    } finally {
      setDownloading(false);
    }
  };

  // ─── Auto-Generate Persona ───
  const genPersona = async () => {
    if (!genNiche.trim()) return;
    setGenerating(true); setGlobalError(null);
    try {
      const text = await callAPI({ modelId: selectedModelId, system: PERSONA_GEN_PROMPT, userMessage: `Generate an adversarial persona for: ${genNiche}\nMake them deeply skeptical and calibrated to this industry.`, maxTokens: 1000 });
      const p = extractJSON(text);
      const id = addPersona(p);
      setSelectedIds(prev => [...prev, id]);
      setGenNiche(""); setView("research");
    } catch (err) { setGlobalError({ title: "Persona Generation Failed", message: err.message, retryable: true }); }
    finally { setGenerating(false); }
  };

  // ─── Pre-Mortem ───
  const runSteelMan = async (personaResults, signal) => {
    setSteelManning(true); setGlobalError(null);
    try {
      const summary = Object.entries(personaResults).map(([pid, r]) => {
        const p = personas.find(pp => pp.id === pid);
        return p ? `${p.name}: ${r.headline}\nDealbreakers: ${(r.dealbreakers||[]).join("; ")}\nBuy%: ${r.buyProbability}%\nCompetitor: ${r.competitorMention}` : "";
      }).filter(Boolean).join("\n---\n");
      const text = await callAPI({ modelId: selectedModelId, system: STEELMAN_PROMPT, userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}`, maxTokens: 1500, signal });
      setSteelMan(extractJSON(text)); setActiveTab("steelman");
    } catch (err) {
      if (err.name === "AbortError") throw err;
      setGlobalError({ title: "Pre-Mortem Failed", message: err.message, detail: err.message, retryable: true });
    } finally { setSteelManning(false); }
  };

  // ─── JTBD Synthesis ───
  const runSynthesis = async (personaResults, signal) => {
    setSynthesizing(true); setGlobalError(null);
    try {
      const summary = Object.entries(personaResults).map(([pid, r]) => {
        const p = personas.find(pp => pp.id === pid);
        return p ? `PERSONA: ${p.name} (${p.role})\nRatings: Overall ${r.ratings.overall}, Value ${r.ratings.value}, Usability ${r.ratings.usability}, Reliability ${r.ratings.reliability}, Recommend ${r.ratings.wouldRecommend}\nBuy%: ${r.buyProbability}%\nHeadline: ${r.headline}\nReview: ${r.review}\nDealbreakers: ${(r.dealbreakers||[]).join("; ")}\nCompetitor: ${r.competitorMention}\nWishlist: ${(r.wishlist||[]).join("; ")}\nUnsolved Pain Points: ${(r.unsolvedPainPoints||[]).join("; ")}` : "";
      }).filter(Boolean).join("\n\n---\n\n");
      const text = await callAPI({ modelId: selectedModelId, system: JTBD_PROMPT, userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}\n\nAnalyze using JTBD with Four Forces and friction mapping.`, maxTokens: 6000, signal });
      const data = extractJSON(text);
      setSynthesis(data); setActiveTab("jtbd");
      return data;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      setGlobalError({ title: "JTBD Synthesis Failed", message: err.message, detail: err.message, retryable: true });
    } finally { setSynthesizing(false); }
  };

  // ─── Product Rewrite ───
  const runRewrite = async (personaResults, synthesisData, signal, guidance = "") => {
    setRewriting(true);
    try {
      const personaSummary = Object.entries(personaResults).map(([pid, r]) => {
        const p = personas.find(pp => pp.id === pid);
        return p ? `PERSONA: ${p.name} (${p.role})\nHeadline: ${r.headline}\nReview: ${r.review}\nDealbreakers: ${(r.dealbreakers||[]).join("; ")}\nWishlist: ${(r.wishlist||[]).join("; ")}\nUnsolved Pain Points: ${(r.unsolvedPainPoints||[]).join("; ")}\nBuy%: ${r.buyProbability}%` : "";
      }).filter(Boolean).join("\n\n---\n\n");
      const jtbdSummary = synthesisData ? `EXECUTIVE SUMMARY: ${synthesisData.executiveSummary}\nFORCES: Push — ${synthesisData.forces?.push} | Pull — ${synthesisData.forces?.pull} | Anxiety — ${synthesisData.forces?.anxiety} | Habit — ${synthesisData.forces?.habit}\nTOP JOBS: ${(synthesisData.jobs||[]).map(j => j.statement).join(" / ")}\nMARKET GAPS: ${(synthesisData.marketGaps||[]).map(g => `${g.gap} (${g.demand} demand)`).join("; ")}` : "";
      const guidanceSection = guidance.trim() ? `\n\nADDITIONAL DIRECTION: ${guidance.trim()}` : "";
      const text = await callAPI({ modelId: selectedModelId, system: REWRITE_PROMPT, userMessage: `ORIGINAL PRODUCT: ${productName}\nORIGINAL DESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nPERSONA FEEDBACK:\n${personaSummary}\n\nJTBD SYNTHESIS:\n${jtbdSummary}${guidanceSection}\n\nRewrite the product offering based on all of this.`, maxTokens: 3000, signal });
      setRewrite(extractJSON(text)); setActiveTab("rewrite");
    } catch (err) {
      if (err.name === "AbortError") throw err;
      setGlobalError({ title: "Product Rewrite Failed", message: err.message, detail: err.message, retryable: true });
    } finally { setRewriting(false); }
  };

  // ─── Main Research (Parallel) ───
  const runResearch = async () => {
    if (!productName.trim()) return;
    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    setGlobalError(null); setSynthesis(null); setSteelMan(null); setRewrite(null); setActiveTab("feedback"); setPersonaErrors({});
    const sel = personas.filter(p => selectedIds.includes(p.id));
    if (!sel.length) return;
    const nl = {}; sel.forEach(p => nl[p.id] = true); setLoading(nl); setResults({});

    try {
      // Parallel persona execution
      const settled = await Promise.allSettled(sel.map(async (persona) => {
        try {
          const text = await callAPI({
            modelId: selectedModelId,
            system: buildSystemPrompt(persona, comps, cynicism),
            userMessage: `Review this product:\n\nProduct: ${productName}\nDescription: ${productDesc || "No description — evaluate from your knowledge."}\n${comps.length ? `Known Competitors: ${comps.join(", ")}` : ""}\n\nGive your honest assessment.`,
            thinking: true,
            signal,
          });
          const parsed = extractJSON(text);
          setResults(prev => ({ ...prev, [persona.id]: parsed }));
          setLoading(prev => ({ ...prev, [persona.id]: false }));
          return { id: persona.id, result: parsed };
        } catch (err) {
          setLoading(prev => ({ ...prev, [persona.id]: false }));
          if (err.name !== "AbortError") setPersonaErrors(prev => ({ ...prev, [persona.id]: err.message }));
          throw err;
        }
      }));

      if (signal.aborted) return;

      const allResults = {};
      settled.forEach(s => { if (s.status === "fulfilled") allResults[s.value.id] = s.value.result; });
      setLastResults(allResults);

      // Auto-run synthesis, pre-mortem, and rewrite if 2+ results
      if (Object.keys(allResults).length >= 2) {
        const synthesisData = await runSynthesis(allResults, signal);
        await runSteelMan(allResults, signal);
        await runRewrite(allResults, synthesisData, signal);
      }
    } catch (err) {
      if (err.name !== "AbortError") setGlobalError({ title: "Research Failed", message: err.message, retryable: true });
    } finally {
      abortRef.current = null;
    }
  };

  // ─── Retry single persona ───
  const retrySingle = async (persona) => {
    setPersonaErrors(prev => { const n = { ...prev }; delete n[persona.id]; return n; });
    setLoading(prev => ({ ...prev, [persona.id]: true }));
    try {
      const text = await callAPI({ modelId: selectedModelId, system: buildSystemPrompt(persona, comps, cynicism), userMessage: `Review this product:\n\nProduct: ${productName}\nDescription: ${productDesc || "No description."}\n${comps.length ? `Known Competitors: ${comps.join(", ")}` : ""}\n\nGive your honest assessment.` });
      setResults(prev => { const u = { ...prev, [persona.id]: extractJSON(text) }; setLastResults(u); return u; });
    } catch (err) { setPersonaErrors(prev => ({ ...prev, [persona.id]: err.message })); }
    finally { setLoading(prev => ({ ...prev, [persona.id]: false })); }
  };

  const save = () => { if (editPersona) { updatePersona(editPersona); setEditPersona(null); } setView("research"); };
  const create = () => { const id = addPersona({ ...newPersona, id: `c-${Date.now()}`, petPeeves: newPersona.petPeeves.filter(x => x.trim()) }); setSelectedIds(p => [...p, id]); setNewPersona({ name: "", role: "", avatar: "🧑", color: "#8B5CF6", traits: { skepticism: 7, technicalDepth: 5, priceConscious: 7, easeOfUseWeight: 7, brandLoyalty: 3 }, backstory: "", averageRating: 4, petPeeves: [""], pedigree: { calibratedFrom: "", biasProfile: "", blindSpot: "" } }); setView("research"); };

  const anyLoad = Object.values(loading).some(Boolean);
  const rc = Object.keys(results).length;
  const busy = anyLoad || synthesizing || steelManning || rewriting;

  return (
    <div style={{ minHeight: "100vh", background: "var(--s0)", color: "var(--t1)", fontFamily: "var(--mono)", padding: 24, boxSizing: "border-box", "--s0": "#0B0B0F", "--s1": "#14141A", "--s2": "#1C1C24", "--bdr": "#2A2A35", "--t1": "#E4E4EC", "--t2": "#7A7A8C", "--accent": "#E84855", "--heading": "'Space Grotesk', sans-serif", "--mono": "'DM Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        {/* ─── Header ─── */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 8, height: 32, borderRadius: 2, background: "linear-gradient(180deg, #E84855, #F9A03F)" }} /><h1 style={{ fontFamily: "var(--heading)", fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Persona Research Lab</h1></div>
            <div style={{ fontSize: 12, color: "var(--t2)", marginTop: 4, marginLeft: 18 }}>Parallel feedback → JTBD + Four Forces → Pre-mortem → Decisions</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <select 
                value={selectedModelId} 
                onChange={e => setSelectedModelId(e.target.value)}
                style={{ padding: "8px 32px 8px 12px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, cursor: "pointer", appearance: "none" }}
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.freeTier ? " (Free Tier)" : ""}
                  </option>
                ))}
              </select>
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--t2)", fontSize: 10 }}>▼</div>
            </div>
            <button onClick={() => setView("settings")} style={{ padding: "8px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", cursor: "pointer", fontSize: 14 }}>⚙️</button>
            <button onClick={() => setView("generate")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, cursor: "pointer" }}>⚡ Auto-Generate</button>
            <button onClick={() => setView("create")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, cursor: "pointer" }}>+ Manual Create</button>
          </div>
        </div>

        {/* ─── Editor Views ─── */}
        {view === "settings" && <SettingsPanel onClose={() => setView("research")} />}
        {view === "customize" && editPersona && <PersonaEditor persona={editPersona} setPersona={setEditPersona} onSave={save} title="Edit Persona" onCancel={() => setView("research")} />}
        {view === "create" && <PersonaEditor persona={newPersona} setPersona={setNewPersona} onSave={create} title="Create Persona" onCancel={() => setView("research")} />}
        {view === "generate" && (
          <Card style={{ maxWidth: 500, margin: "0 auto", marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}><h2 style={{ fontFamily: "var(--heading)", fontSize: 18, fontWeight: 700, margin: 0, color: "var(--t1)" }}>Auto-Generate Persona</h2><button onClick={() => setView("research")} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontSize: 16 }}>✕</button></div>
            <div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 12, lineHeight: 1.5 }}>Describe your niche and we'll generate a domain-specific adversarial persona. E.g. "healthcare SaaS", "crypto trading", "restaurant POS"</div>
            <input placeholder="Industry niche..." value={genNiche} onChange={e => setGenNiche(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13, boxSizing: "border-box", marginBottom: 12 }} />
            <button onClick={genPersona} disabled={!genNiche.trim() || generating} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: genNiche.trim() && !generating ? "linear-gradient(135deg, #2EC4B6, #3185FC)" : "var(--s2)", color: genNiche.trim() && !generating ? "#fff" : "var(--t2)", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, cursor: genNiche.trim() && !generating ? "pointer" : "default" }}>{generating ? "Generating..." : "Generate Adversarial Persona"}</button>
          </Card>
        )}

        {/* ─── Research View ─── */}
        {view === "research" && (
          <>
            {/* Persona Selection */}
            <div style={{ marginBottom: 20 }}>
              <SH>Select Personas</SH>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {personas.map(p => (
                  <div key={p.id} style={{ position: "relative" }}>
                    <div onClick={() => toggle(p.id)} style={{ padding: "14px 16px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s", border: `2px solid ${selectedIds.includes(p.id) ? p.color : "var(--bdr)"}`, background: selectedIds.includes(p.id) ? p.color + "11" : "var(--s1)", minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 28 }}>{p.avatar}</span><div><div style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--heading)", color: "var(--t1)" }}>{p.name}</div><div style={{ fontSize: 11, color: "var(--t2)", fontFamily: "var(--mono)" }}>{p.role}</div></div></div>
                      <div style={{ marginTop: 8, fontSize: 11, color: "var(--t2)", fontFamily: "var(--mono)" }}>Avg: {p.averageRating}/10 · Skepticism: {p.traits.skepticism}/10</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setEditPersona({ ...p }); setView("customize"); }} style={{ position: "absolute", top: 6, right: 6, background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 4, color: "var(--t2)", fontSize: 10, cursor: "pointer", padding: "2px 6px" }}>edit</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Input */}
            <Card style={{ marginBottom: 20 }}>
              <input placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--heading)", fontWeight: 600, fontSize: 16, boxSizing: "border-box", marginBottom: 10 }} />
              <textarea placeholder="Description, pricing, target audience..." value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={3} style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />

              {/* Competitors */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>Competitor Intelligence</div>
                {competitors.map((c, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}><input value={c} onChange={e => { const u = [...competitors]; u[i] = e.target.value; setCompetitors(u); }} placeholder={`Competitor ${i + 1}`} style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--bdr)", borderRadius: 6, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12 }} />{competitors.length > 1 && <button onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#E84855", cursor: "pointer" }}>−</button>}</div>)}
                {competitors.length < 5 && <button onClick={() => setCompetitors([...competitors, ""])} style={{ marginTop: 4, background: "none", border: "1px dashed var(--bdr)", borderRadius: 6, padding: "4px 12px", color: "var(--t2)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer" }}>+ Add</button>}
              </div>

              {/* Cynicism */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700 }}>Cynicism Level</div>
                  <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: cynicism >= 4 ? "#E84855" : cynicism <= 2 ? "#2EC4B6" : "var(--t2)", fontWeight: 700 }}>{CYNICISM_LABELS[cynicism]}</div>
                </div>
                <input type="range" min={1} max={5} value={cynicism} onChange={e => setCynicism(parseInt(e.target.value))} style={{ width: "100%", accentColor: cynicism >= 4 ? "#E84855" : cynicism <= 2 ? "#2EC4B6" : "#F9A03F" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--t2)", fontFamily: "var(--mono)" }}><span>Generous</span><span>Ruthless</span></div>
              </div>

              <button onClick={runResearch} disabled={!productName.trim() || !selectedIds.length || busy} style={{ width: "100%", padding: 14, borderRadius: 8, border: "none", letterSpacing: 0.5, background: productName.trim() && selectedIds.length && !busy ? "var(--accent)" : "var(--s2)", color: productName.trim() && selectedIds.length && !busy ? "#fff" : "var(--t2)", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, cursor: productName.trim() && selectedIds.length && !busy ? "pointer" : "default" }}>
                {anyLoad ? "Personas reviewing (parallel)..." : synthesizing ? "JTBD synthesis..." : steelManning ? "Pre-mortem..." : `Run Full Analysis (${selectedIds.length} persona${selectedIds.length > 1 ? "s" : ""})`}
              </button>
            </Card>

            {/* Errors */}
            <ErrorBanner error={globalError} onDismiss={() => setGlobalError(null)} onRetry={globalError?.title?.includes("JTBD") && lastResults ? () => runSynthesis(lastResults) : globalError?.title?.includes("Pre-Mortem") && lastResults ? () => runSteelMan(lastResults) : globalError?.title?.includes("Persona") ? genPersona : null} />

            {/* Loading */}
            {(anyLoad || synthesizing || steelManning || rewriting) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {personas.filter(p => loading[p.id]).map(p => <div key={p.id} style={{ padding: 16, background: "var(--s1)", borderRadius: 10, border: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 12 }}><span style={{ fontSize: 24 }}>{p.avatar}</span><div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>{p.name} reviewing...</div><div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, animation: "pulse 1.5s infinite" }}>{CYNICISM_LABELS[cynicism]} mode</div></div></div>)}
                {synthesizing && <div style={{ padding: 16, background: "var(--s1)", borderRadius: 10, border: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #2EC4B6" }}><span style={{ fontSize: 24 }}>⚡</span><div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>JTBD + Four Forces</div><div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, animation: "pulse 1.5s infinite" }}>Mapping jobs, forces, and friction...</div></div></div>}
                {steelManning && <div style={{ padding: 16, background: "var(--s1)", borderRadius: 10, border: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #E84855" }}><span style={{ fontSize: 24 }}>💀</span><div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>Pre-Mortem Agent</div><div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, animation: "pulse 1.5s infinite" }}>Finding failure modes...</div></div></div>}
                {rewriting && <div style={{ padding: 16, background: "var(--s1)", borderRadius: 10, border: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #8B5CF6" }}><span style={{ fontSize: 24 }}>✨</span><div><div style={{ fontWeight: 600, fontSize: 13, color: "var(--t1)" }}>Product Rewrite Agent</div><div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, animation: "pulse 1.5s infinite" }}>Rewriting offering from feedback...</div></div></div>}
                <button onClick={stopResearch} style={{ alignSelf: "flex-start", padding: "8px 18px", borderRadius: 8, border: "1px solid #E8485566", background: "#E8485518", color: "#E84855", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>⏹ Stop</button>
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
              </div>
            )}

            {/* Tabs */}
            {(rc > 0 || Object.keys(personaErrors).length > 0) && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <TabBtn active={activeTab === "feedback"} onClick={() => setActiveTab("feedback")} badge={rc}>Feedback</TabBtn>
                {rc > 1 && <TabBtn active={activeTab === "comparison"} onClick={() => setActiveTab("comparison")}>Compare</TabBtn>}
                <TabBtn active={activeTab === "jtbd"} onClick={() => setActiveTab("jtbd")} badge={synthesis ? "✓" : null}>JTBD + Forces</TabBtn>
                <TabBtn active={activeTab === "steelman"} onClick={() => setActiveTab("steelman")} badge={steelMan ? "💀" : null}>Pre-Mortem</TabBtn>
                <TabBtn active={activeTab === "rewrite"} onClick={() => setActiveTab("rewrite")} badge={rewrite ? "✨" : null}>Rewrite</TabBtn>
                {rc >= 2 && !steelMan && !steelManning && <button onClick={() => runSteelMan(results)} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 8, border: "1px solid #E8485555", background: "#E8485515", color: "#E84855", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>💀 Tell Me Why I'm Wrong</button>}
                <button onClick={handleDownloadPDF} disabled={downloading} style={{ marginLeft: rc >= 2 && !steelMan && !steelManning ? 0 : "auto", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--bdr)", background: downloading ? "var(--s2)" : "var(--s1)", color: downloading ? "var(--t2)" : "var(--t1)", fontFamily: "var(--mono)", fontSize: 11, cursor: downloading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>{downloading ? "Generating..." : "↓ Download PDF"}</button>
              </div>
            )}

            {viewMethodology && <MethodologyPanel persona={viewMethodology} competitors={comps} cynicism={cynicism} onClose={() => setViewMethodology(null)} />}

            {/* Feedback Tab */}
            {activeTab === "feedback" && <>
              {personas.filter(p => results[p.id]).map(p => <FeedbackPanel key={p.id} result={results[p.id]} persona={p} onViewMethodology={() => setViewMethodology(viewMethodology?.id === p.id ? null : p)} />)}
              {personas.filter(p => personaErrors[p.id]).map(p => <Card key={p.id} style={{ marginTop: 16, borderLeft: "3px solid #E84855" }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 28 }}>{p.avatar}</span><div style={{ flex: 1 }}><div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{p.name}</div><div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "#E84855", marginTop: 2 }}>{personaErrors[p.id]}</div></div><button onClick={() => retrySingle(p)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #E8485555", background: "#E8485520", color: "#E84855", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Retry</button></div></Card>)}
            </>}

            {/* Comparison Tab */}
            {activeTab === "comparison" && rc > 1 && <Card>
              <SH>Rating Comparison</SH>
              <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}><thead><tr><th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--bdr)", color: "var(--t2)" }}>Persona</th>{RATING_DIMS.map(d => <th key={d.key} style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--bdr)", color: "var(--t2)", fontSize: 10 }}>{d.label}</th>)}<th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--bdr)", color: "var(--t2)", fontSize: 10 }}>Buy%</th></tr></thead><tbody>{personas.filter(p => results[p.id]).map(p => <tr key={p.id}><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--bdr)" }}>{p.avatar} {p.name}</td>{RATING_DIMS.map(d => { const v = results[p.id].ratings[d.key]; const c = v <= 3 ? "#E84855" : v <= 5 ? "#F9A03F" : v <= 7 ? "#3185FC" : "#2EC4B6"; return <td key={d.key} style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--bdr)", color: c, fontWeight: 700 }}>{v}</td>; })}<td style={{ textAlign: "center", padding: 8, borderBottom: "1px solid var(--bdr)", fontWeight: 700, color: parseInt(results[p.id].buyProbability) < 30 ? "#E84855" : parseInt(results[p.id].buyProbability) < 60 ? "#F9A03F" : "#2EC4B6" }}>{results[p.id].buyProbability}%</td></tr>)}</tbody></table></div>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--bdr)" }}>
                <SH>Dealbreaker Convergence</SH>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{(() => { const db = {}; personas.filter(p => results[p.id]).forEach(p => (results[p.id].dealbreakers||[]).forEach(d => { const k = d.toLowerCase().slice(0, 40); if (!db[k]) db[k] = { text: d, n: 0, av: [] }; db[k].n++; db[k].av.push(p.avatar); })); return Object.values(db).sort((a, b) => b.n - a.n).map((d, i) => <div key={i} style={{ padding: "6px 10px", background: d.n > 1 ? "#E8485518" : "var(--s2)", border: `1px solid ${d.n > 1 ? "#E8485544" : "var(--bdr)"}`, borderRadius: 6, fontSize: 11, fontFamily: "var(--mono)", color: "var(--t1)" }}><span style={{ marginRight: 4 }}>{d.av.join("")}</span> {d.text}</div>); })()}</div>
              </div>
            </Card>}

            {/* JTBD Tab */}
            {activeTab === "jtbd" && (synthesis ? <JTBDPanel synthesis={synthesis} /> : <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div><div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 16, color: "var(--t1)", marginBottom: 6 }}>No synthesis yet</div><div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 16 }}>{rc < 2 ? "Need 2+ persona results" : "Run research to generate"}</div>{rc >= 2 && !synthesizing && <button onClick={() => runSynthesis(results)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #2EC4B6, #3185FC)", color: "#fff", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Run JTBD Synthesis</button>}</Card>)}

            {/* Pre-Mortem Tab */}
            {activeTab === "steelman" && (steelMan ? <SteelManPanel steelMan={steelMan} /> : <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 32, marginBottom: 12 }}>💀</div><div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 16, color: "var(--t1)", marginBottom: 6 }}>No pre-mortem yet</div><div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 16 }}>{rc < 2 ? "Need 2+ persona results" : "Click 'Tell Me Why I'm Wrong'"}</div>{rc >= 2 && !steelManning && <button onClick={() => runSteelMan(results)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#E84855", color: "#fff", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>💀 Tell Me Why I'm Wrong</button>}</Card>)}

            {/* Rewrite Tab */}
            {activeTab === "rewrite" && (
              <>
                {rewrite ? <RewritePanel rewrite={rewrite} /> : (
                  <Card style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                    <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 16, color: "var(--t1)", marginBottom: 6 }}>No rewrite yet</div>
                    <div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 16 }}>{rc < 2 ? "Need 2+ persona results" : "Runs automatically after JTBD synthesis"}</div>
                    {rc >= 2 && synthesis && !rewriting && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <textarea
                          value={rewriteGuidance}
                          onChange={e => setRewriteGuidance(e.target.value)}
                          placeholder="Optional direction — e.g. 'Focus on the clinical oversight angle', 'Emphasize no waiting rooms', 'Target the 38–45 demographic'"
                          rows={3}
                          style={{ width: "100%", maxWidth: 480, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, resize: "vertical", outline: "none" }}
                        />
                        <button onClick={() => runRewrite(results, synthesis, undefined, rewriteGuidance)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8B5CF6, #3185FC)", color: "#fff", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✨ Rewrite Product Offering</button>
                      </div>
                    )}
                  </Card>
                )}
                {rewrite && !rewriting && rc >= 2 && synthesis && (
                  <Card style={{ marginTop: 16, padding: 20 }}>
                    <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)", marginBottom: 10 }}>↻ Re-run Rewrite</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <textarea
                        value={rewriteGuidance}
                        onChange={e => setRewriteGuidance(e.target.value)}
                        placeholder="Optional direction — e.g. 'Focus on the clinical oversight angle', 'Emphasize no waiting rooms', 'Target the 38–45 demographic'"
                        rows={2}
                        style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, resize: "vertical", outline: "none" }}
                      />
                      <button onClick={() => runRewrite(results, synthesis, undefined, rewriteGuidance)} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8B5CF6, #3185FC)", color: "#fff", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>↻ Re-run</button>
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
