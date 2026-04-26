import { useState } from "react";

export const Card = ({ children, style = {} }) => (
  <div style={{ background: "var(--s1)", borderRadius: 12, border: "1px solid var(--bdr)", padding: 20, ...style }}>
    {children}
  </div>
);

export const SH = ({ children, sub }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700 }}>
      {children}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2, fontFamily: "var(--mono)", opacity: 0.7 }}>
        {sub}
      </div>
    )}
  </div>
);

export const PB = ({ p }) => {
  const c = { critical: "#E84855", high: "#F9A03F", medium: "#3185FC", low: "#666" };
  return (
    <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, color: c[p], background: c[p] + "18", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--mono)" }}>
      {p}
    </span>
  );
};

export const TabBtn = ({ active, onClick, children, badge }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      borderRadius: 8,
      border: `1px solid ${active ? "var(--accent)" : "var(--bdr)"}`,
      background: active ? "var(--accent)18" : "var(--s1)",
      color: active ? "var(--accent)" : "var(--t2)",
      fontFamily: "var(--mono)",
      fontSize: 11,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontWeight: active ? 700 : 400
    }}
  >
    {children}
    {badge && (
      <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700 }}>
        {badge}
      </span>
    )}
  </button>
);

export const RatingBar = ({ value, label, icon }) => {
  const c = value <= 3 ? "#E84855" : value <= 5 ? "#F9A03F" : value <= 7 ? "#3185FC" : "#2EC4B6";
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", marginBottom: 3, color: "var(--t2)" }}>
        <span>{icon} {label}</span>
        <span style={{ color: c, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{ height: 6, background: "var(--s2)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(value / 10) * 100}%`, background: c, borderRadius: 3, transition: "width 0.6s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
};

export const TraitSlider = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--mono)", color: "var(--t2)", marginBottom: 2 }}>
      <span>{label}</span>
      <span>{value}/10</span>
    </div>
    <input type="range" min={1} max={10} value={value} onChange={e => onChange(parseInt(e.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
  </div>
);

export const ErrorBanner = ({ error, onDismiss, onRetry }) => {
  const [exp, setExp] = useState(false);
  if (!error) return null;
  return (
    <div style={{ padding: 14, background: "#E8485512", border: "1px solid #E8485533", borderRadius: 10, fontFamily: "var(--mono)", fontSize: 12, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#E84855", fontWeight: 700, marginBottom: 4 }}>✕ {error.title || "Error"}</div>
          <div style={{ color: "var(--t2)", lineHeight: 1.5 }}>{error.message}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {error.retryable !== false && onRetry && (
            <button onClick={onRetry} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #E8485555", background: "#E8485520", color: "#E84855", fontFamily: "var(--mono)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              Retry
            </button>
          )}
          <button onClick={onDismiss} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "transparent", color: "var(--t2)", fontSize: 14, cursor: "pointer" }}>✕</button>
        </div>
      </div>
      {error.detail && (
        <>
          <button onClick={() => setExp(!exp)} style={{ marginTop: 8, background: "none", border: "none", color: "var(--t2)", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10, padding: 0, textDecoration: "underline" }}>
            {exp ? "Hide" : "Show"} details
          </button>
          {exp && (
            <pre style={{ marginTop: 6, padding: 10, background: "var(--s2)", borderRadius: 6, fontSize: 10, color: "var(--t2)", whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 200, overflowY: "auto" }}>
              {error.detail}
            </pre>
          )}
        </>
      )}
    </div>
  );
};

export const BuyFormula = ({ params, prob }) => {
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
