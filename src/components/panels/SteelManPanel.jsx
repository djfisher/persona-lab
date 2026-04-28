import { Card } from "../Common";

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
