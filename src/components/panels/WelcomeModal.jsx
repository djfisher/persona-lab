import { Card } from "../Common";

export const WelcomeModal = ({ onSkip, onLoadExample }) => {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <Card style={{ maxWidth: 500, width: "100%", position: "relative", padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid var(--bdr)" }}>
        
        <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>🔬</div>
        
        <h2 style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: "var(--t1)", textAlign: "center", margin: "0 0 12px 0" }}>
          Welcome to Persona Lab
        </h2>
        
        <p style={{ fontSize: 14, color: "var(--t2)", fontFamily: "var(--mono)", lineHeight: 1.6, textAlign: "center", marginBottom: 32 }}>
          Stop guessing what users want. Describe your product, select adversarial personas, and generate instant, brutal feedback. 
          The app will then automatically synthesize the results using the <strong>Jobs-to-be-Done (JTBD)</strong> framework.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button 
            onClick={onLoadExample}
            style={{ 
              padding: "14px", 
              borderRadius: 8, 
              border: "none", 
              background: "linear-gradient(135deg, #8B5CF6, #3185FC)", 
              color: "#fff", 
              fontFamily: "var(--heading)", 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: "pointer",
              transition: "transform 0.1s, opacity 0.2s",
              boxShadow: "0 4px 12px rgba(49, 133, 252, 0.3)"
            }}
            onMouseOver={e => e.currentTarget.style.opacity = 0.9}
            onMouseOut={e => e.currentTarget.style.opacity = 1}
          >
            ✨ See how it works with an example
          </button>
          
          <button 
            onClick={onSkip}
            style={{ 
              padding: "12px", 
              borderRadius: 8, 
              border: "1px solid var(--bdr)", 
              background: "transparent", 
              color: "var(--t2)", 
              fontFamily: "var(--mono)", 
              fontSize: 13, 
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseOver={e => e.currentTarget.style.background = "var(--s2)"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            Skip, I'll start from scratch
          </button>
        </div>

        <div style={{ fontSize: 10, color: "var(--t2)", fontFamily: "var(--mono)", textAlign: "center", marginTop: 24, opacity: 0.6 }}>
          (Requires a free Gemini or Claude API key to run your own research)
        </div>
      </Card>
    </div>
  );
};
