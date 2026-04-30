import { useState, useEffect, useCallback } from "react";
import { useHistory } from "./useHistory";

export function useProducts(userId) {
  const { getProducts, createProduct, updateProduct } = useHistory(userId);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getProducts()
      .then(data => setProducts(data || []))
      .catch(err => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const selectProduct = useCallback((product) => {
    setSelectedProduct(product);
  }, []);

  const ensureProduct = useCallback(async ({ name, description }) => {
    if (!userId) return null;

    const base = selectedProduct
      ?? products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())
      ?? null;

    if (base) {
      const changed =
        base.name !== name ||
        (base.description || "") !== (description || "");
      if (changed) {
        const updated = await updateProduct(base.id, { name, description });
        setSelectedProduct(updated);
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
        return updated;
      }
      setSelectedProduct(base);
      return base;
    }

    const created = await createProduct({ name, description });
    setSelectedProduct(created);
    setProducts(prev => [created, ...prev]);
    return created;
  }, [userId, selectedProduct, products, createProduct, updateProduct]);

  return { products, selectedProduct, selectProduct, ensureProduct, loading };
}
