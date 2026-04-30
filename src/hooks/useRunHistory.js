import { useState, useEffect, useCallback } from "react";
import { useHistory } from "./useHistory";

export function useRunHistory(userId, productId) {
  const { getProductRuns } = useHistory(userId);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!userId || !productId) { setRuns([]); return; }
    setLoading(true);
    try {
      const data = await getProductRuns(productId);
      setRuns(data || []);
    } catch (err) {
      console.error("Failed to load run history:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, productId, getProductRuns]);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  return { runs, loading, refreshRuns: fetchRuns };
}
