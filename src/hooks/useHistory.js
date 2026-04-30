import { useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useHistory(userId) {
  // ─── Products ───────────────────────────────────────────────────────────────

  const getProducts = useCallback(async () => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data;
  }, [userId]);

  const createProduct = useCallback(async ({ name, description }) => {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from("products")
      .insert({ name, description, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [userId]);

  const updateProduct = useCallback(async (id, { name, description }) => {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from("products")
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [userId]);

  // ─── Runs ────────────────────────────────────────────────────────────────────

  const saveRun = useCallback(async ({
    productId, cynicism, modelId, competitors, selectedPersonaIds,
    results, synthesis, steelman, rewrite,
  }) => {
    if (!supabase || !userId) return null;

    const { data: run, error: runError } = await supabase
      .from("research_runs")
      .insert({
        product_id: productId,
        user_id: userId,
        cynicism,
        model_id: modelId,
        competitors,
        selected_persona_ids: selectedPersonaIds,
        synthesis: synthesis ?? null,
        steelman: steelman ?? null,
        rewrite: rewrite ?? null,
      })
      .select()
      .single();
    if (runError) throw runError;

    const rows = Object.entries(results).map(([personaId, result]) => ({
      run_id: run.id,
      persona_id: personaId,
      result,
    }));

    const { error: resultsError } = await supabase
      .from("persona_results")
      .insert(rows);
    if (resultsError) throw resultsError;

    return run;
  }, [userId]);

  const updateRun = useCallback(async (runId, patch) => {
    if (!supabase || !userId) return null;
    const { data, error } = await supabase
      .from("research_runs")
      .update(patch)
      .eq("id", runId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, [userId]);

  const getProductRuns = useCallback(async (productId) => {
    if (!supabase || !userId) return [];
    const { data, error } = await supabase
      .from("research_runs")
      .select("*, persona_results(*)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  }, [userId]);

  return { getProducts, createProduct, updateProduct, saveRun, updateRun, getProductRuns };
}
