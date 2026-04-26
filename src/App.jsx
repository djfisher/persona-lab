import { useState, useRef } from "react";
import { downloadFeedbackPDF } from "./FeedbackPDF";
import { usePersonas } from "./personas/usePersonas";


const RATING_DIMS = [
  { key: "overall", label: "Overall", icon: "◆" },
  { key: "value", label: "Value", icon: "$" },
  { key: "usability", label: "Usability", icon: "◎" },
  { key: "reliability", label: "Reliability", icon: "⚙" },
  { key: "wouldRecommend", label: "Recommend", icon: "➤" },
];

const CYNICISM_LABELS = { 1: "Generous", 2: "Fair", 3: "Skeptical", 4: "Harsh", 5: "Ruthless" };

// ─── PROMPTS ───
function buildSystemPrompt(persona, competitors, cynicism = 3) {
  const cyMod = cynicism <= 2 ? `You're in a generous mood. Ratings skew ${1 + cynicism * 0.3} points above baseline.`
    : cynicism >= 4 ? `You're especially unforgiving. Ratings skew ${(cynicism - 3) * 0.8} points BELOW baseline. Assume every product is trying to scam you.`
    : "You're at your default critical baseline.";
  const compSection = competitors.length > 0
    ? `\nKNOWN COMPETITORS: ${competitors.join(", ")}\nYou MUST compare against at least one of these.`
    : "\nAlways name a competitor or alternative.";

  return `You ARE ${persona.name} — ${persona.role}. Never break character.
Backstory: ${persona.backstory}
Baseline rating: ${persona.averageRating}/10
Traits (1-10): Skepticism ${persona.traits.skepticism}, Tech Depth ${persona.traits.technicalDepth}, Price Sensitivity ${persona.traits.priceConscious}, UX Weight ${persona.traits.easeOfUseWeight}, Brand Loyalty ${persona.traits.brandLoyalty}
Pet peeves: ${persona.petPeeves.join(", ")}

CYNICISM: ${cyMod}
${compSection}

RULES:
- Baseline ${persona.averageRating}/10. 7+ is rare praise. 8+ once a year. 9-10 never.
- NEVER soften criticism. Speak like venting to a colleague. No corporate jargon.
- ALWAYS state concrete reasons NOT to buy.
- For buyProbability, compute: round((value + usability) / (${persona.traits.priceConscious} * ${persona.traits.skepticism}) * 25) and show your work.

Respond ONLY with valid JSON, no markdown fences:
{
  "ratings": { "overall": <1-10>, "value": <1-10>, "usability": <1-10>, "reliability": <1-10>, "wouldRecommend": <1-10> },
  "headline": "<one blunt sentence>",
  "review": "<2-3 paragraphs, specific and critical>",
  "dealbreakers": ["<reason 1>", "<reason 2>"],
  "competitorMention": "<specific competitor and why>",
  "buyProbability": <0-100>,
  "buyParams": { "val": <value rating>, "usa": <usability rating>, "pri": ${persona.traits.priceConscious}, "ske": ${persona.traits.skepticism} },
  "wishlist": ["<specific feature a competitor has that you love and this product lacks>", "<capability that would seal the deal for you personally>"],
  "unsolvedPainPoints": ["<pain point the entire market including competitors still fails to solve>"]
}`;
}

const JTBD_PROMPT = `You are a product strategist using Clayton Christensen's JTBD framework.
Analyze persona feedback to find shared jobs and map the FOUR FORCES of switching.

RULES:
- Jobs: "When [situation], I want to [motivation], so I can [outcome]"
- Map FOUR FORCES: Push (pain of current state), Pull (appeal of new solution), Anxiety (fear of switching), Habit (inertia of current behavior)
- Identify FRICTION POINTS: Where personas want contradictory things
- Rate switchingCost 1-10
- 3-5 jobs, 2-4 product options, 2-3 actions, 2-3 validation questions, 2-3 blind spots
- 2-4 market gaps: unmet needs the whole market including competitors fails to solve — these are white-space opportunities

Respond ONLY with valid JSON:
{
  "executiveSummary": "<2-3 sentences>",
  "jobs": [{ "id": "<short-id>", "statement": "When...", "dimension": "functional|emotional|social", "sharedAcross": ["<names>"], "currentlyAddressed": "fully|partially|not_at_all", "evidence": "<signals>", "priority": "critical|high|medium|low" }],
  "forces": { "push": "<pain of current state>", "pull": "<appeal of this product>", "anxiety": "<fear of adopting>", "habit": "<why they'd stick with status quo>" },
  "frictionPoints": [{ "conflict": "<what's contradictory>", "personas": ["<name1>", "<name2>"], "tradeoff": "<how to resolve>" }],
  "switchingCost": { "score": <1-10>, "reason": "<why>" },
  "productOptions": [{ "title": "<name>", "description": "<specific feature>", "jobsAddressed": ["<ids>"], "effort": "low|medium|high", "impact": "low|medium|high", "riskIfIgnored": "<consequence>" }],
  "immediateActions": ["<concrete>"],
  "validationQuestions": ["<specific>"],
  "blindSpots": ["<what personas miss>"],
  "marketGaps": [{ "gap": "<unmet need no one is solving well>", "demand": "high|medium|low", "personasAffected": ["<name1>", "<name2>"], "opportunity": "<how this product could own this space>", "competitorAttempt": "<how competitors try and fail at this>" }]
}`;

const REWRITE_PROMPT = `You are a senior product strategist. Given adversarial persona feedback, JTBD synthesis, wishlists, and market gap analysis, rewrite and sharpen the product offering.

RULES:
- Ground every recommendation in specific evidence from the feedback — no generic advice
- Preserve the core value prop but sharpen the positioning dramatically
- Be specific about features ("add one-tap lab ordering" not "improve the process")
- Prioritize ruthlessly: most things are not critical
- The rewritten pitch must speak directly to the jobs-to-be-done, not the features

Respond ONLY with valid JSON:
{
  "tagline": "<rewritten one-liner that speaks to the core job-to-be-done>",
  "elevatorPitch": "<2-3 sentence rewritten product description that directly addresses the top concerns>",
  "targetCustomer": "<sharpened ICP — who this product is actually for, based on who the feedback resonates with most>",
  "keyImprovements": [{ "title": "<improvement name>", "rationale": "<grounded in specific feedback>", "addressesPersonas": ["<name>"] }],
  "featuresToAdd": [{ "feature": "<specific feature>", "source": "<which persona wishlist or market gap drove this>", "priority": "critical|high|medium" }],
  "featuresToCut": [{ "feature": "<what to cut or deprioritize>", "reason": "<why it's a distraction or liability>" }],
  "positioningStatement": "<how to win vs named competitors, using the market gaps>",
  "messagingByPersona": [{ "persona": "<name>", "hook": "<specific one-liner that would resonate with this exact person>" }],
  "pricingGuidance": "<actionable pricing recommendation grounded in the price-sensitivity signals>"
}`;

const STEELMAN_PROMPT = `You are a startup failure analyst. Given persona feedback, generate a pre-mortem: most likely reasons this business FAILS within 12 months.
RULES: Ignore positives. Be specific to THIS product. Think market timing, competitive dynamics, unit economics, execution risk.

Respond ONLY with valid JSON:
{
  "verdict": "<one brutal sentence>",
  "failureScenarios": [{ "title": "<name>", "probability": "high|medium|low", "description": "<2-3 sentences>", "evidence": "<persona signals>" }],
  "fatalAssumption": "<single biggest wrong assumption>",
  "survivalCondition": "<one thing that MUST be true to survive>"
}`;

const PERSONA_GEN_PROMPT = `Generate an adversarial product research persona for a specific industry. They should be deeply skeptical, experienced, hard to impress.

Respond ONLY with valid JSON:
{
  "name": "<realistic name>", "role": "<role + years>", "avatar": "<emoji>", "color": "<hex>",
  "backstory": "<3-4 sentences, industry-specific critical worldview>",
  "averageRating": <3-5>, "petPeeves": ["<industry peeve 1>", "<2>", "<3>", "<4>"],
  "traits": { "skepticism": <7-10>, "technicalDepth": <1-10>, "priceConscious": <1-10>, "easeOfUseWeight": <1-10>, "brandLoyalty": <1-3> },
  "pedigree": { "calibratedFrom": "<experience>", "biasProfile": "<known biases>", "blindSpot": "<what they miss>" }
}`;

// ─── API & UTILS ───
async function callAPI({ system, userMessage, maxTokens = 4096, thinking = false, signal }, retries = 3) {
  const API_KEY = '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';

  const body = {
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
    ...(thinking && { thinking: { type: "adaptive" } }),
  };

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body),
  });

  if (resp.status === 429 && retries > 0) {
    const retryAfter = parseInt(resp.headers.get("retry-after") || "20", 10);
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, retryAfter * 1000);
      signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); });
    });
    return callAPI({ system, userMessage, maxTokens, thinking, signal }, retries - 1);
  }

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    let d = body; try { d = JSON.parse(body)?.error?.message || body; } catch {}
    throw new Error(`API ${resp.status}: ${d}`);
  }
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const textBlock = (data.content || []).find(c => c.type === "text");
  if (!textBlock?.text?.trim()) throw new Error("Empty API response");
  return textBlock.text;
}

function extractJSON(text) {
  let c = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(c); } catch {}
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s !== -1 && e > s) try { return JSON.parse(c.slice(s, e + 1)); } catch {}
  throw new Error(`JSON parse failed. First 300 chars: ${text.slice(0, 300)}`);
}

// ─── UI COMPONENTS ───
const Card = ({ children, style = {} }) => <div style={{ background: "var(--s1)", borderRadius: 12, border: "1px solid var(--bdr)", padding: 20, ...style }}>{children}</div>;
const SH = ({ children, sub }) => <div style={{ marginBottom: 14 }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700 }}>{children}</div>{sub && <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, fontFamily: "var(--mono)", opacity: 0.7 }}>{sub}</div>}</div>;
const PB = ({ p }) => { const c = { critical: "#E84855", high: "#F9A03F", medium: "#3185FC", low: "#666" }; return <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: c[p], background: c[p] + "18", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>{p}</span>; };
const TabBtn = ({ active, onClick, children, badge }) => <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${active ? "var(--accent)" : "var(--bdr)"}`, background: active ? "var(--accent)18" : "var(--s1)", color: active ? "var(--accent)" : "var(--t2)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: active ? 700 : 400 }}>{children}{badge && <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}</button>;

const RatingBar = ({ value, label, icon }) => {
  const c = value <= 3 ? "#E84855" : value <= 5 ? "#F9A03F" : value <= 7 ? "#3185FC" : "#2EC4B6";
  return <div style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", marginBottom: 3, color: "var(--t2)" }}><span>{icon} {label}</span><span style={{ color: c, fontWeight: 700 }}>{value}/10</span></div><div style={{ height: 6, background: "var(--s2)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${(value / 10) * 100}%`, background: c, borderRadius: 3, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} /></div></div>;
};

const TraitSlider = ({ label, value, onChange }) => <div style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", marginBottom: 2 }}><span>{label}</span><span>{value}/10</span></div><input type="range" min={1} max={10} value={value} onChange={e => onChange(parseInt(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} /></div>;

// ─── Error Banner ───
const ErrorBanner = ({ error, onDismiss, onRetry }) => {
  const [exp, setExp] = useState(false);
  if (!error) return null;
  return <div style={{ padding: 14, background: "#E8485512", border: "1px solid #E8485533", borderRadius: 10, fontFamily: "var(--mono)", fontSize: 12, marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div style={{ flex: 1 }}><div style={{ color: "#E84855", fontWeight: 700, marginBottom: 4 }}>✕ {error.title || "Error"}</div><div style={{ color: "var(--t2)", lineHeight: 1.5 }}>{error.message}</div></div>
      <div style={{ display: "flex", gap: 6 }}>
        {error.retryable !== false && onRetry && <button onClick={onRetry} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #E8485555", background: "#E8485520", color: "#E84855", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Retry</button>}
        <button onClick={onDismiss} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "transparent", color: "var(--t2)", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>
    </div>
    {error.detail && <><button onClick={() => setExp(!exp)} style={{ marginTop: 8, background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10, padding: 0, textDecoration: "underline" }}>{exp ? "Hide" : "Show"} details</button>{exp && <pre style={{ marginTop: 6, padding: 10, background: "var(--s2)", borderRadius: 6, fontSize: 10, color: "var(--t2)", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 200, overflowY: "auto" }}>{error.detail}</pre>}</>}
  </div>;
};

// ─── Buy Probability Formula ───
const BuyFormula = ({ params, prob }) => {
  if (!params) return null;
  const calculated = Math.round((params.val + params.usa) / (params.pri * params.ske) * 25);
  return (
    <div style={{ marginTop: 10, padding: 10, background: "var(--s0)", borderRadius: 8, border: "1px dashed var(--bdr)", fontFamily: "var(--mono)", fontSize: 11 }}>
      <div style={{ color: "var(--t2)", marginBottom: 4, textTransform: "uppercase", fontSize: 9, letterSpacing: 1 }}>Buy Probability Audit</div>
      <div style={{ color: "var(--t1)" }}>
        round((<span style={{ color: "#2EC4B6" }}>val:{params.val}</span> + <span style={{ color: "#3185FC" }}>usa:{params.usa}</span>) / (<span style={{ color: "#F9A03F" }}>price:{params.pri}</span> × <span style={{ color: "#E84855" }}>skep:{params.ske}</span>) × 25) = <span style={{ color: "#E84855", fontWeight: 700 }}>{calculated}%</span>
        {Math.abs(calculated - parseInt(prob)) > 5 && <span style={{ color: "var(--t2)", marginLeft: 8 }}>(persona reported {prob}%)</span>}
      </div>
    </div>
  );
};

// ─── Methodology Panel ───
const MethodologyPanel = ({ persona, competitors, cynicism, onClose }) => (
  <Card style={{ position: "relative", marginBottom: 16, borderLeft: `3px solid ${persona.color}` }}>
    <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontSize: 16 }}>✕</button>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 24 }}>{persona.avatar}</span>
      <div>
        <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>Methodology: {persona.name}</div>
        <div style={{ fontSize: 10, color: "var(--t2)", fontFamily: "var(--mono)" }}>Why this persona thinks the way it does</div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
      <div style={{ padding: 12, background: "var(--s2)", borderRadius: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: persona.color, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>Calibrated From</div>
        <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5 }}>{persona.pedigree?.calibratedFrom || "General product evaluation experience"}</div>
      </div>
      <div style={{ padding: 12, background: "var(--s2)", borderRadius: 8 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>Known Biases</div>
        <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5 }}>{persona.pedigree?.biasProfile || "Standard critical evaluation bias"}</div>
      </div>
    </div>
    <div style={{ padding: 12, background: "#F9A03F0A", borderRadius: 8, border: "1px solid #F9A03F22", marginBottom: 16 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 4 }}>⚠ Known Blind Spot</div>
      <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5 }}>{persona.pedigree?.blindSpot || "May miss edge cases outside domain"}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
      {[["Skepticism", persona.traits.skepticism], ["Tech Depth", persona.traits.technicalDepth], ["Price Sens.", persona.traits.priceConscious], ["UX Weight", persona.traits.easeOfUseWeight], ["Loyalty", persona.traits.brandLoyalty]].map(([l, v]) => (
        <div key={l} style={{ textAlign: "center", padding: 8, background: "var(--s2)", borderRadius: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "var(--heading)", color: v >= 7 ? "#E84855" : v >= 4 ? "#F9A03F" : "#2EC4B6" }}>{v}</div>
          <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--t2)", fontFamily: "var(--mono)", marginTop: 2 }}>{l}</div>
        </div>
      ))}
    </div>
    <details style={{ cursor: "pointer" }}>
      <summary style={{ fontSize: 10, color: "var(--t2)", fontFamily: "var(--mono)" }}>View raw system prompt</summary>
      <pre style={{ background: "var(--s2)", borderRadius: 8, padding: 12, fontSize: 10, lineHeight: 1.5, fontFamily: "var(--mono)", color: "var(--t2)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 300, overflowY: "auto", border: "1px solid var(--bdr)", marginTop: 8 }}>
        {buildSystemPrompt(persona, competitors || [], cynicism || 3)}
      </pre>
    </details>
  </Card>
);

// ─── Feedback Panel ───
const FeedbackPanel = ({ result, persona, onViewMethodology }) => {
  if (!result) return null;
  const oc = result.ratings.overall <= 3 ? "#E84855" : result.ratings.overall <= 5 ? "#F9A03F" : result.ratings.overall <= 7 ? "#3185FC" : "#2EC4B6";
  return (
    <Card style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--bdr)" }}>
        <span style={{ fontSize: 32 }}>{persona.avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 16, color: "var(--t1)" }}>{persona.name}</span>
            <button onClick={onViewMethodology} style={{ background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 4, color: "var(--t2)", fontSize: 9, cursor: "pointer", padding: "2px 8px", fontFamily: "var(--mono)" }}>methodology</button>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: persona.color, fontStyle: "italic", marginTop: 2 }}>"{result.headline}"</div>
        </div>
        <div style={{ textAlign: "center", background: oc + "18", borderRadius: 10, padding: "8px 14px" }}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--heading)", color: oc }}>{result.ratings.overall}</div>
          <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--t2)", textTransform: "uppercase", letterSpacing: 1 }}>Overall</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          {RATING_DIMS.filter(d => d.key !== "overall").map(d => <RatingBar key={d.key} value={result.ratings[d.key]} label={d.label} icon={d.icon} />)}
          <BuyFormula params={result.buyParams} prob={result.buyProbability} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--t1)", fontFamily: "var(--mono)", whiteSpace: "pre-wrap" }}>{result.review}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        <div style={{ padding: 12, background: "#E8485512", borderRadius: 8, border: "1px solid #E8485533" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#E84855", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>✕ Dealbreakers</div>
          {(result.dealbreakers || []).map((d, i) => <div key={i} style={{ fontSize: 12, color: "var(--t1)", fontFamily: "var(--mono)", marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #E84855" }}>{d}</div>)}
        </div>
        <div style={{ padding: 12, background: "#3185FC12", borderRadius: 8, border: "1px solid #3185FC33" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#3185FC", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>↗ Competitor Preferred</div>
          <div style={{ fontSize: 12, color: "var(--t1)", fontFamily: "var(--mono)", lineHeight: 1.5 }}>{result.competitorMention || "None specified"}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        <div style={{ padding: 12, background: "#2EC4B612", borderRadius: 8, border: "1px solid #2EC4B633" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#2EC4B6", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>★ Wishlist — What Would Seal the Deal</div>
          {(result.wishlist || []).map((w, i) => <div key={i} style={{ fontSize: 12, color: "var(--t1)", fontFamily: "var(--mono)", marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #2EC4B6" }}>{w}</div>)}
        </div>
        <div style={{ padding: 12, background: "#F9A03F12", borderRadius: 8, border: "1px solid #F9A03F33" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>◎ Pain Points No One Solves</div>
          {(result.unsolvedPainPoints || []).map((p, i) => <div key={i} style={{ fontSize: 12, color: "var(--t1)", fontFamily: "var(--mono)", marginBottom: 4, paddingLeft: 8, borderLeft: "2px solid #F9A03F" }}>{p}</div>)}
        </div>
      </div>
    </Card>
  );
};

// ─── Steel Man Panel ───
const SteelManPanel = ({ steelMan }) => {
  if (!steelMan) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E84855", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💀</div>
        <div><div style={{ fontFamily: "var(--heading)", fontWeight: 800, fontSize: 18, color: "var(--t1)" }}>Pre-Mortem: Tell Me Why I'm Wrong</div><div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)" }}>Most likely failure scenarios, 12-month horizon</div></div>
      </div>
      <Card style={{ borderLeft: "3px solid #E84855", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontFamily: "var(--mono)", color: "#E84855", fontWeight: 700, lineHeight: 1.5 }}>{steelMan.verdict}</div>
      </Card>
      {(steelMan.failureScenarios || []).map((s, i) => {
        const pc = s.probability === "high" ? "#E84855" : s.probability === "medium" ? "#F9A03F" : "#3185FC";
        return <Card key={i} style={{ marginBottom: 10, borderLeft: `3px solid ${pc}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{s.title}</div>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, color: pc, background: pc + "18", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>{s.probability}</span>
          </div>
          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6, marginBottom: 6 }}>{s.description}</div>
          {s.evidence && <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", fontStyle: "italic" }}>Evidence: {s.evidence}</div>}
        </Card>;
      })}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card style={{ borderTop: "3px solid #E84855" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#E84855", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>Fatal Assumption</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6 }}>{steelMan.fatalAssumption}</div>
        </Card>
        <Card style={{ borderTop: "3px solid #2EC4B6" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#2EC4B6", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>Survival Condition</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6 }}>{steelMan.survivalCondition}</div>
        </Card>
      </div>
    </div>
  );
};

// ─── JTBD Panel (with Four Forces + Friction from Gemini) ───
const JTBDPanel = ({ synthesis }) => {
  const [exp, setExp] = useState(null);
  if (!synthesis) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #2EC4B6, #3185FC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
        <div><div style={{ fontFamily: "var(--heading)", fontWeight: 800, fontSize: 18, color: "var(--t1)" }}>JTBD Synthesis</div><div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)" }}>Christensen Framework · Four Forces · Friction Map</div></div>
      </div>

      <Card style={{ marginBottom: 16, borderLeft: "3px solid #2EC4B6" }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#2EC4B6", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>Executive Summary</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--t1)", fontFamily: "var(--mono)" }}>{synthesis.executiveSummary}</div>
      </Card>

      {/* Four Forces */}
      {synthesis.forces && (
        <div style={{ marginBottom: 24 }}>
          <SH sub="What's driving adoption decisions?">◆ Four Forces of Switching</SH>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["🔥", "Push", synthesis.forces.push, "#E84855"], ["🧲", "Pull", synthesis.forces.pull, "#2EC4B6"], ["😰", "Anxiety", synthesis.forces.anxiety, "#F9A03F"], ["🧊", "Habit", synthesis.forces.habit, "#3185FC"]].map(([icon, label, text, color]) => (
              <Card key={label} style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>{icon} {label}</div>
                <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5 }}>{text}</div>
              </Card>
            ))}
          </div>
          {synthesis.switchingCost && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--s2)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)" }}>Switching Cost</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 120, height: 6, background: "var(--s1)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${synthesis.switchingCost.score * 10}%`, background: synthesis.switchingCost.score >= 7 ? "#E84855" : synthesis.switchingCost.score >= 4 ? "#F9A03F" : "#2EC4B6", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", color: synthesis.switchingCost.score >= 7 ? "#E84855" : synthesis.switchingCost.score >= 4 ? "#F9A03F" : "#2EC4B6" }}>{synthesis.switchingCost.score}/10</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Friction Points */}
      {synthesis.frictionPoints?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SH sub="Where personas want contradictory things">◆ Persona Friction</SH>
          {synthesis.frictionPoints.map((f, i) => (
            <Card key={i} style={{ marginBottom: 8, borderLeft: "3px solid #E84855" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)" }}>{(f.personas || []).join(" vs ")}</div>
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5, marginBottom: 4 }}>{f.conflict}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#2EC4B6", fontStyle: "italic" }}>Resolution: {f.tradeoff}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Jobs */}
      <SH sub="What are people hiring this product to do?">◆ Identified Jobs</SH>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {(synthesis.jobs || []).map((j, i) => (
          <Card key={i} style={{ cursor: "pointer", borderLeft: `3px solid ${j.priority === "critical" ? "#E84855" : j.priority === "high" ? "#F9A03F" : "#3185FC"}` }} onClick={() => setExp(exp === i ? null : i)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <PB p={j.priority} />
                  {j.dimension && <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: j.dimension === "functional" ? "#3185FC" : j.dimension === "emotional" ? "#E84855" : "#2EC4B6", fontFamily: "var(--mono)", fontWeight: 600 }}>{j.dimension}</span>}
                  {j.currentlyAddressed && <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: "var(--t2)", background: j.currentlyAddressed === "not_at_all" ? "#E8485518" : j.currentlyAddressed === "partially" ? "#F9A03F18" : "#2EC4B618", padding: "2px 6px", borderRadius: 3 }}>{j.currentlyAddressed === "not_at_all" ? "⬤ unaddressed" : j.currentlyAddressed === "partially" ? "◐ partial" : "● addressed"}</span>}
                </div>
                <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5, fontStyle: "italic" }}>"{j.statement}"</div>
                <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", marginTop: 6 }}>Shared by: {(j.sharedAcross || []).join(", ")}</div>
              </div>
              <span style={{ color: "var(--t2)", fontSize: 14, transform: exp === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>▸</span>
            </div>
            {exp === i && j.evidence && <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--bdr)", fontSize: 12, fontFamily: "var(--mono)", color: "var(--t2)", lineHeight: 1.6 }}><strong style={{ color: "var(--t1)" }}>Evidence:</strong> {j.evidence}</div>}
          </Card>
        ))}
      </div>

      {/* Product Options */}
      {synthesis.productOptions?.length > 0 && <>
        <SH sub="Ranked by effort vs impact">◆ Product Options</SH>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {synthesis.productOptions.map((o, i) => <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 15, color: "var(--t1)" }}>{o.title}</div>
              <div style={{ display: "flex", gap: 8, fontSize: 10, fontFamily: "var(--mono)" }}><span style={{ color: o.effort === "low" ? "#2EC4B6" : o.effort === "medium" ? "#F9A03F" : "#E84855" }}>effort: {o.effort}</span><span style={{ color: "var(--bdr)" }}>|</span><span style={{ color: o.impact === "high" ? "#2EC4B6" : o.impact === "medium" ? "#F9A03F" : "#E84855" }}>impact: {o.impact}</span></div>
            </div>
            <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6, marginBottom: 8 }}>{o.description}</div>
            {o.riskIfIgnored && <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "#E84855", fontStyle: "italic" }}>Risk if ignored: {o.riskIfIgnored}</div>}
          </Card>)}
        </div>
      </>}

      {/* Market Gaps */}
      {synthesis.marketGaps?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SH sub="Unmet needs the whole market — including competitors — fails to solve">◆ Market Gaps & White Space</SH>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {synthesis.marketGaps.map((g, i) => {
              const dc = g.demand === "high" ? "#E84855" : g.demand === "medium" ? "#F9A03F" : "#3185FC";
              return (
                <Card key={i} style={{ borderLeft: "3px solid #2EC4B6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, color: "var(--t1)", flex: 1 }}>{g.gap}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, color: dc, background: dc + "18", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>{g.demand} demand</span>
                      {(g.personasAffected || []).map(n => <span key={n} style={{ fontSize: 10, color: "var(--t2)", fontFamily: "var(--mono)" }}>{n}</span>)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "#2EC4B6", lineHeight: 1.5, marginBottom: 4 }}>Opportunity: {g.opportunity}</div>
                  {g.competitorAttempt && <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", fontStyle: "italic" }}>Competitors: {g.competitorAttempt}</div>}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Action columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[["#2EC4B6", "⚡ Do This Week", synthesis.immediateActions], ["#3185FC", "? Validate With Users", synthesis.validationQuestions], ["#F9A03F", "⚠ Blind Spots", synthesis.blindSpots]].map(([col, title, items]) => <Card key={title} style={{ borderTop: `3px solid ${col}` }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: col, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>{title}</div>{(items || []).map((a, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid ${col}`, lineHeight: 1.5 }}>{a}</div>)}</Card>)}
      </div>
    </div>
  );
};

// ─── Rewrite Panel ───
const RewritePanel = ({ rewrite }) => {
  if (!rewrite) return null;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #8B5CF6, #3185FC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
        <div>
          <div style={{ fontFamily: "var(--heading)", fontWeight: 800, fontSize: 18, color: "var(--t1)" }}>Improved Product Offering</div>
          <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)" }}>Rewritten using all persona feedback + JTBD synthesis</div>
        </div>
      </div>

      {/* Tagline + Pitch + ICP */}
      <Card style={{ marginBottom: 12, borderLeft: "3px solid #8B5CF6" }}>
        <div style={{ fontSize: 22, fontFamily: "var(--heading)", fontWeight: 800, color: "var(--t1)", lineHeight: 1.3, marginBottom: 12 }}>{rewrite.tagline}</div>
        <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.7, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--bdr)" }}>{rewrite.elevatorPitch}</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", fontFamily: "var(--mono)", fontWeight: 700, whiteSpace: "nowrap", marginTop: 1 }}>Target Customer</div>
          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t2)", lineHeight: 1.5 }}>{rewrite.targetCustomer}</div>
        </div>
      </Card>

      {/* Key Improvements + Features to Add */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <SH sub="Changes grounded in persona feedback">◆ Key Improvements</SH>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(rewrite.keyImprovements || []).map((k, i) => (
              <Card key={i} style={{ borderLeft: "3px solid #8B5CF6" }}>
                <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)", marginBottom: 4 }}>{k.title}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", lineHeight: 1.5, marginBottom: 4 }}>{k.rationale}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(k.addressesPersonas || []).map(n => <span key={n} style={{ fontSize: 9, color: "#8B5CF6", background: "#8B5CF618", border: "1px solid #8B5CF633", borderRadius: 4, padding: "1px 6px", fontFamily: "var(--mono)" }}>{n}</span>)}
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <SH sub="Prioritized by impact on conversion">◆ Features to Build</SH>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(rewrite.featuresToAdd || []).map((f, i) => {
              const pc = f.priority === "critical" ? "#E84855" : f.priority === "high" ? "#F9A03F" : "#3185FC";
              return (
                <Card key={i} style={{ borderLeft: `3px solid ${pc}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontFamily: "var(--heading)", fontWeight: 700, fontSize: 13, color: "var(--t1)" }}>{f.feature}</div>
                    <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, color: pc, background: pc + "18", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>{f.priority}</span>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)" }}>From: {f.source}</div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Positioning + Features to Cut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Card style={{ borderTop: "3px solid #2EC4B6" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#2EC4B6", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>◎ Positioning vs Competitors</div>
          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6 }}>{rewrite.positioningStatement}</div>
        </Card>
        <Card style={{ borderTop: "3px solid #E84855" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#E84855", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 8 }}>✕ Cut or Deprioritize</div>
          {(rewrite.featuresToCut || []).map((f, i) => (
            <div key={i} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: "2px solid #E84855" }}>
              <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", fontWeight: 600 }}>{f.feature}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", marginTop: 2 }}>{f.reason}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Per-Persona Messaging */}
      {(rewrite.messagingByPersona || []).length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SH sub="One hook per persona — what actually lands">◆ Messaging by Persona</SH>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {rewrite.messagingByPersona.map((m, i) => (
              <Card key={i} style={{ borderLeft: "3px solid #F9A03F" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 5 }}>{m.persona}</div>
                <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.5, fontStyle: "italic" }}>"{m.hook}"</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pricing */}
      {rewrite.pricingGuidance && (
        <Card style={{ borderLeft: "3px solid #F9A03F" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>$ Pricing Guidance</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6 }}>{rewrite.pricingGuidance}</div>
        </Card>
      )}
    </div>
  );
};

// ─── Persona Editor ───
const PersonaEditor = ({ persona, setPersona, onSave, title, onCancel }) => (
  <div style={{ maxWidth: 560, margin: "0 auto" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <h2 style={{ fontFamily: "var(--heading)", fontSize: 20, fontWeight: 700, color: "var(--t1)", margin: 0 }}>{title}</h2>
      <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontSize: 18 }}>✕</button>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 10, marginBottom: 14 }}>
      <input value={persona.avatar} onChange={e => setPersona({ ...persona, avatar: e.target.value })} style={{ width: 48, height: 48, fontSize: 28, textAlign: "center", border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)" }} />
      <input placeholder="Name" value={persona.name} onChange={e => setPersona({ ...persona, name: e.target.value })} style={{ padding: "10px 12px", border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13 }} />
      <input placeholder="Role" value={persona.role} onChange={e => setPersona({ ...persona, role: e.target.value })} style={{ padding: "10px 12px", border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13 }} />
    </div>
    <textarea placeholder="Backstory" value={persona.backstory} onChange={e => setPersona({ ...persona, backstory: e.target.value })} rows={3} style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
      {[["Calibrated From", "calibratedFrom"], ["Bias Profile", "biasProfile"], ["Blind Spot", "blindSpot"]].map(([label, key]) => (
        <div key={key}><div style={{ fontSize: 11, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 4 }}>{label}</div><input value={persona.pedigree?.[key] || ""} onChange={e => setPersona({ ...persona, pedigree: { ...persona.pedigree, [key]: e.target.value } })} style={{ width: "100%", padding: "6px 10px", border: "1px solid var(--bdr)", borderRadius: 6, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 11, boxSizing: "border-box" }} /></div>
      ))}
    </div>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>Traits</div>
      {[["Skepticism","skepticism"],["Technical Depth","technicalDepth"],["Price Consciousness","priceConscious"],["Ease of Use Weight","easeOfUseWeight"],["Brand Loyalty","brandLoyalty"]].map(([l,k]) => <TraitSlider key={k} label={l} value={persona.traits[k]} onChange={v => setPersona({ ...persona, traits: { ...persona.traits, [k]: v } })} />)}
    </div>
    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 4 }}>Avg Rating</div><input type="number" min={1} max={10} step={0.5} value={persona.averageRating} onChange={e => setPersona({ ...persona, averageRating: parseFloat(e.target.value) || 4 })} style={{ width: "100%", padding: "8px 10px", border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13, boxSizing: "border-box" }} /></div>
      <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 4 }}>Color</div><input type="color" value={persona.color} onChange={e => setPersona({ ...persona, color: e.target.value })} style={{ width: "100%", height: 36, border: "none", borderRadius: 8, cursor: "pointer" }} /></div>
    </div>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>Pet Peeves</div>
      {persona.petPeeves.map((p, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}><input value={p} onChange={e => { const u = [...persona.petPeeves]; u[i] = e.target.value; setPersona({ ...persona, petPeeves: u }); }} style={{ flex: 1, padding: "6px 10px", border: "1px solid var(--bdr)", borderRadius: 6, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12 }} />{persona.petPeeves.length > 1 && <button onClick={() => setPersona({ ...persona, petPeeves: persona.petPeeves.filter((_, j) => j !== i) })} style={{ background: "none", border: "none", color: "#E84855", cursor: "pointer" }}>−</button>}</div>)}
      <button onClick={() => setPersona({ ...persona, petPeeves: [...persona.petPeeves, ""] })} style={{ marginTop: 4, background: "none", border: "1px dashed var(--bdr)", borderRadius: 6, padding: "4px 12px", color: "var(--t2)", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer" }}>+ Add</button>
    </div>
    <button onClick={onSave} disabled={!persona.name || !persona.backstory} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: persona.name && persona.backstory ? persona.color : "var(--s2)", color: persona.name && persona.backstory ? "#fff" : "var(--t2)", fontFamily: "var(--heading)", fontWeight: 700, fontSize: 14, cursor: persona.name && persona.backstory ? "pointer" : "default" }}>{title === "Edit Persona" ? "Save Changes" : "Create Persona"}</button>
  </div>
);

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App() {
  const { personas, addPersona, updatePersona } = usePersonas();
  const [selectedIds, setSelectedIds] = useState(() => personas.map(p => p.id));
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
    try {
      await downloadFeedbackPDF({ personas, results, synthesis, steelMan, rewrite, productName, productDesc });
    } finally {
      setDownloading(false);
    }
  };

  // ─── Auto-Generate Persona ───
  const genPersona = async () => {
    if (!genNiche.trim()) return;
    setGenerating(true); setGlobalError(null);
    try {
      const text = await callAPI({ system: PERSONA_GEN_PROMPT, userMessage: `Generate an adversarial persona for: ${genNiche}\nMake them deeply skeptical and calibrated to this industry.`, maxTokens: 1000 });
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
      const text = await callAPI({ system: STEELMAN_PROMPT, userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}`, maxTokens: 1500, signal });
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
      const text = await callAPI({ system: JTBD_PROMPT, userMessage: `PRODUCT: ${productName}\nDESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nFEEDBACK:\n${summary}\n\nAnalyze using JTBD with Four Forces and friction mapping.`, maxTokens: 4000, signal });
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
      const text = await callAPI({ system: REWRITE_PROMPT, userMessage: `ORIGINAL PRODUCT: ${productName}\nORIGINAL DESCRIPTION: ${productDesc || "N/A"}\nCOMPETITORS: ${comps.join(", ") || "Not specified"}\n\nPERSONA FEEDBACK:\n${personaSummary}\n\nJTBD SYNTHESIS:\n${jtbdSummary}${guidanceSection}\n\nRewrite the product offering based on all of this.`, maxTokens: 3000, signal });
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
      const text = await callAPI({ system: buildSystemPrompt(persona, comps, cynicism), userMessage: `Review this product:\n\nProduct: ${productName}\nDescription: ${productDesc || "No description."}\n${comps.length ? `Known Competitors: ${comps.join(", ")}` : ""}\n\nGive your honest assessment.` });
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
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("generate")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, cursor: "pointer" }}>⚡ Auto-Generate</button>
            <button onClick={() => setView("create")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--bdr)", background: "var(--s1)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 12, cursor: "pointer" }}>+ Manual Create</button>
          </div>
        </div>

        {/* ─── Editor Views ─── */}
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
