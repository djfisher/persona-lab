import { Card } from "../Common";
import { buildSystemPrompt } from "../../prompts";

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
