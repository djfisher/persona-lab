import { TraitSlider } from "../Common";

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
