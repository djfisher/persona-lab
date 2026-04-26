import { useState } from "react";
import { Card, SH, PB, RatingBar, TraitSlider, BuyFormula } from "../Common";
import { buildSystemPrompt } from "../../prompts";

const RATING_DIMS = [
  { key: "overall", label: "Overall", icon: "◆" },
  { key: "value", label: "Value", icon: "$" },
  { key: "usability", label: "Usability", icon: "◎" },
  { key: "reliability", label: "Reliability", icon: "⚙" },
  { key: "wouldRecommend", label: "Recommend", icon: "➤" },
];

export const MethodologyPanel = ({ persona, competitors, cynicism, onClose }) => (
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

export const FeedbackPanel = ({ result, persona, onViewMethodology }) => {
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

export const SteelManPanel = ({ steelMan }) => {
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

export const JTBDPanel = ({ synthesis }) => {
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

export const RewritePanel = ({ rewrite }) => {
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

export const PersonaEditor = ({ persona, setPersona, onSave, title, onCancel }) => (
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
