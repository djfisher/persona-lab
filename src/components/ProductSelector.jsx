export const ProductSelector = ({ products, selectedProduct, onSelect }) => {
  if (!products.length) return null;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--bdr)" }}>
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--t2)", fontFamily: "var(--mono)", fontWeight: 700, whiteSpace: "nowrap" }}>
        Previous Product
      </div>
      <div style={{ position: "relative", flex: 1 }}>
        <select
          value={selectedProduct?.id || ""}
          onChange={e => onSelect(
            e.target.value === ""
              ? null
              : products.find(p => p.id === e.target.value) ?? null
          )}
          style={{
            width: "100%",
            padding: "8px 32px 8px 12px",
            borderRadius: 8,
            border: "1px solid var(--bdr)",
            background: "var(--s2)",
            color: selectedProduct ? "var(--t1)" : "var(--t2)",
            fontFamily: "var(--mono)",
            fontSize: 12,
            cursor: "pointer",
            appearance: "none",
          }}
        >
          <option value="">— new product —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--t2)", fontSize: 10 }}>▼</div>
      </div>
    </div>
  );
};
