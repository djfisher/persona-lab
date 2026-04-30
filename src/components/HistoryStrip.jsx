const relativeDate = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const avgBuy = (run) => {
  if (!run.persona_results?.length) return null;
  const vals = run.persona_results.map(pr => parseInt(pr.result?.buyProbability ?? 0));
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

const avgRating = (run) => {
  const vals = (run.persona_results || [])
    .map(pr => pr.result?.ratings?.overall)
    .filter(v => v != null && v > 0);
  if (!vals.length) return null;
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
};

export const HistoryStrip = ({ runs, onLoad }) => {
  if (!runs.length) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 }}>
        Run History
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {runs.map((run, i) => {
          const buy = avgBuy(run);
          const rating = avgRating(run);
          const prevBuy = i < runs.length - 1 ? avgBuy(runs[i + 1]) : null;
          const delta = buy !== null && prevBuy !== null ? buy - prevBuy : null;
          const personaCount = run.persona_results?.length ?? 0;

          return (
            <div key={run.id} style={{
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              padding: "10px 14px", borderRadius: 8,
              background: "var(--s1)", border: "1px solid var(--bdr)",
              fontFamily: "var(--mono)", fontSize: 12,
            }}>
              <span style={{ color: "var(--t2)", minWidth: 68 }}>
                {relativeDate(run.created_at)}
              </span>

              {buy !== null && (
                <span style={{
                  fontWeight: 700, minWidth: 58,
                  color: buy < 30 ? "#E84855" : buy < 60 ? "#F9A03F" : "#2EC4B6",
                }}>
                  {buy}% buy
                </span>
              )}

              {rating !== null && (
                <span style={{ color: "var(--t2)", minWidth: 48 }}>
                  {rating}/10
                </span>
              )}

              {delta !== null && (
                <span style={{
                  padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                  background: delta > 0 ? "#2EC4B618" : delta < 0 ? "#E8485518" : "var(--s2)",
                  color: delta > 0 ? "#2EC4B6" : delta < 0 ? "#E84855" : "var(--t2)",
                  border: `1px solid ${delta > 0 ? "#2EC4B633" : delta < 0 ? "#E8485533" : "var(--bdr)"}`,
                }}>
                  {delta > 0 ? "+" : ""}{delta}%
                </span>
              )}

              <span style={{ color: "var(--t2)", fontSize: 10, marginLeft: "auto" }}>
                {personaCount} persona{personaCount !== 1 ? "s" : ""}
              </span>

              <button
                onClick={() => onLoad(run)}
                style={{
                  padding: "5px 12px", borderRadius: 6,
                  border: "1px solid var(--bdr)", background: "var(--s2)",
                  color: "var(--t1)", fontFamily: "var(--mono)", fontSize: 11,
                  cursor: "pointer", fontWeight: 700,
                }}
              >
                Load
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
