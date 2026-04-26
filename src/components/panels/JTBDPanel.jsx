import { useState } from "react";
import { Card, SH, PB } from "../Common";

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[["#2EC4B6", "⚡ Do This Week", synthesis.immediateActions], ["#3185FC", "? Validate With Users", synthesis.validationQuestions], ["#F9A03F", "⚠ Blind Spots", synthesis.blindSpots]].map(([col, title, items]) => <Card key={title} style={{ borderTop: `3px solid ${col}` }}><div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: col, fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>{title}</div>{(items || []).map((a, i) => <div key={i} style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t1)", marginBottom: 8, paddingLeft: 8, borderLeft: `2px solid ${col}`, lineHeight: 1.5 }}>{a}</div>)}</Card>)}
      </div>
    </div>
  );
};
