import { Card, SH } from "../Common";

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

      <Card style={{ marginBottom: 12, borderLeft: "3px solid #8B5CF6" }}>
        <div style={{ fontSize: 22, fontFamily: "var(--heading)", fontWeight: 800, color: "var(--t1)", lineHeight: 1.3, marginBottom: 12 }}>{rewrite.tagline}</div>
        <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.7, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--bdr)" }}>{rewrite.elevatorPitch}</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", fontFamily: "var(--mono)", fontWeight: 700, whiteSpace: "nowrap", marginTop: 1 }}>Target Customer</div>
          <div style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--t2)", lineHeight: 1.5 }}>{rewrite.targetCustomer}</div>
        </div>
      </Card>

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

      {rewrite.pricingGuidance && (
        <Card style={{ borderLeft: "3px solid #F9A03F" }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "#F9A03F", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 6 }}>$ Pricing Guidance</div>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: "var(--t1)", lineHeight: 1.6 }}>{rewrite.pricingGuidance}</div>
        </Card>
      )}
    </div>
  );
};
