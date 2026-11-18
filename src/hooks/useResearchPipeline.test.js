import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../api/llm.js", () => ({
  callAPI: vi.fn(),
  extractJSON: vi.fn((text) => JSON.parse(text)),
  MODELS: [{ id: "test-model", name: "Test", provider: "anthropic" }],
}));

import { callAPI } from "../api/llm.js";
import { useResearchPipeline, PHASES } from "./useResearchPipeline.js";

const mockPersona = (id, name) => ({
  id, name, role: `${name}, Role`, avatar: "🧪", color: "#000",
  traits: { skepticism: 5, technicalDepth: 5, priceConscious: 5, easeOfUseWeight: 5, brandLoyalty: 5 },
  backstory: "Test persona", averageRating: 5, petPeeves: ["test"],
});

const defaultProps = (overrides = {}) => ({
  personas: [mockPersona("p1", "Alpha"), mockPersona("p2", "Beta")],
  selectedIds: ["p1", "p2"],
  selectedModelId: "test-model",
  cynicism: 3,
  productName: "Test Product",
  productDesc: "A test",
  competitors: [],
  user: null,
  ensureProduct: vi.fn(),
  saveRun: vi.fn(),
  refreshRuns: vi.fn(),
  onTabSwitch: vi.fn(),
  ...overrides,
});

const fakePersonaResult = {
  ratings: { overall: 7, value: 7, usability: 7, reliability: 7, wouldRecommend: 7 },
  headline: "fine", review: "review text",
  dealbreakers: ["db1"], competitorMention: "none",
  buyProbability: 60, wishlist: [], unsolvedPainPoints: [],
};

describe("useResearchPipeline", () => {
  beforeEach(() => {
    callAPI.mockReset();
  });

  it("starts in idle phase with empty state", () => {
    const { result } = renderHook(() => useResearchPipeline(defaultProps()));
    expect(result.current.phase).toBe(PHASES.IDLE);
    expect(result.current.results).toEqual({});
    expect(result.current.busy).toBe(false);
    expect(result.current.synthesizing).toBe(false);
  });

  it("loadSnapshot populates results + synthesis and moves to complete", () => {
    const { result } = renderHook(() => useResearchPipeline(defaultProps()));
    act(() => {
      result.current.loadSnapshot({
        results: { p1: fakePersonaResult },
        synthesis: { executiveSummary: "demo" },
        steelMan: null,
        rewrite: null,
      });
    });
    expect(result.current.phase).toBe(PHASES.COMPLETE);
    expect(result.current.results.p1).toEqual(fakePersonaResult);
    expect(result.current.synthesis.executiveSummary).toBe("demo");
    expect(result.current.resultCount).toBe(1);
  });

  it("runSynthesis moves through synthesizing → done, sets synthesis, and triggers tab switch", async () => {
    const synthData = { executiveSummary: "summary", jobs: [] };
    callAPI.mockResolvedValueOnce(JSON.stringify(synthData));
    const onTabSwitch = vi.fn();
    const { result } = renderHook(() => useResearchPipeline(defaultProps({ onTabSwitch })));

    await act(async () => {
      await result.current.runSynthesis({ p1: fakePersonaResult }, undefined);
    });

    expect(result.current.synthesis).toEqual(synthData);
    expect(onTabSwitch).toHaveBeenCalledWith("jtbd");
    expect(result.current.globalError).toBeNull();
  });

  it("runSynthesis surfaces a global error when callAPI throws", async () => {
    callAPI.mockRejectedValueOnce(new Error("rate limited"));
    const { result } = renderHook(() => useResearchPipeline(defaultProps()));

    await act(async () => {
      await result.current.runSynthesis({ p1: fakePersonaResult }, undefined);
    });

    expect(result.current.globalError).toMatchObject({
      title: "JTBD Synthesis Failed",
      message: "rate limited",
      retryable: true,
    });
    expect(result.current.synthesis).toBeNull();
  });

  it("retrySingle clears error, updates results on success, and refreshes lastResults", async () => {
    callAPI.mockResolvedValueOnce(JSON.stringify(fakePersonaResult));
    const { result } = renderHook(() => useResearchPipeline(defaultProps()));
    const persona = mockPersona("p1", "Alpha");

    await act(async () => {
      await result.current.retrySingle(persona, undefined);
    });

    expect(result.current.results.p1).toEqual(fakePersonaResult);
    expect(result.current.lastResults.p1).toEqual(fakePersonaResult);
    expect(result.current.personaErrors.p1).toBeUndefined();
    expect(result.current.loading.p1).toBe(false);
  });

  it("stopResearch aborts in-flight requests and resets personaLoading", async () => {
    // Simulate a hanging callAPI that resolves via abort rejection
    callAPI.mockImplementation(({ signal }) =>
      new Promise((_, reject) => {
        signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
      })
    );

    const { result } = renderHook(() => useResearchPipeline(defaultProps()));

    act(() => { result.current.runResearch(); });
    await waitFor(() => expect(result.current.phase).toBe(PHASES.RUNNING));

    act(() => { result.current.stopResearch(); });
    await waitFor(() => expect(result.current.phase).toBe(PHASES.IDLE));
    expect(Object.values(result.current.loading).every(v => !v)).toBe(true);
  });
});
