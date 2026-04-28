import { Card, RatingBar, RATING_DIMS } from "../Common";

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
