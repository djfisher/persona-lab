import { useState } from "react";
import { Card } from "../Common";

export const SettingsPanel = ({ onClose }) => {
  const [anthropicKey, setAnthropicKey] = useState(localStorage.getItem("persona-lab-anthropic-key") || "");
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem("persona-lab-gemini-key") || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("persona-lab-anthropic-key", anthropicKey.trim());
    localStorage.setItem("persona-lab-gemini-key", geminiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--heading)", fontSize: 20, fontWeight: 700, color: "var(--t1)", margin: 0 }}>⚙️ Settings</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontSize: 18 }}>✕</button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--heading)", fontSize: 16, fontWeight: 700, color: "var(--t1)", marginBottom: 12 }}>API Keys</div>
        <div style={{ fontSize: 12, color: "var(--t2)", fontFamily: "var(--mono)", marginBottom: 16, lineHeight: 1.5 }}>
          Your keys are stored locally in your browser and are never sent to our servers. They are sent directly to Anthropic or Google when generating persona feedback.
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--t1)", fontFamily: "var(--mono)", marginBottom: 6, fontWeight: 600 }}>Anthropic API Key (Claude)</div>
          <input 
            type="password"
            placeholder="sk-ant-..." 
            value={anthropicKey} 
            onChange={e => setAnthropicKey(e.target.value)} 
            style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13, boxSizing: "border-box" }} 
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--t1)", fontFamily: "var(--mono)", marginBottom: 6, fontWeight: 600 }}>Google Gemini API Key</div>
          <input 
            type="password"
            placeholder="AIzaSy..." 
            value={geminiKey} 
            onChange={e => setGeminiKey(e.target.value)} 
            style={{ width: "100%", padding: 12, border: "1px solid var(--bdr)", borderRadius: 8, background: "var(--s2)", color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 13, boxSizing: "border-box" }} 
          />
        </div>

        <button 
          onClick={handleSave} 
          style={{ 
            width: "100%", 
            padding: 12, 
            borderRadius: 8, 
            border: "none", 
            background: saved ? "#2EC4B6" : "var(--t1)", 
            color: "var(--s0)", 
            fontFamily: "var(--heading)", 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: "pointer",
            transition: "background 0.2s"
          }}
        >
          {saved ? "✓ Saved" : "Save Keys"}
        </button>
      </Card>
    </div>
  );
};
