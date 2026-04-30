-- ─── Persona Research Lab — Supabase Schema ────────────────────────────────
-- Run this in the Supabase SQL editor to set up the database.
-- Supabase creates auth.users automatically; we reference it here.

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE research_runs (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id              UUID        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  cynicism             INT         NOT NULL DEFAULT 3,
  model_id             TEXT,
  competitors          TEXT[]      NOT NULL DEFAULT '{}',
  selected_persona_ids TEXT[]      NOT NULL DEFAULT '{}',
  -- 1:1 agent outputs stored as JSONB blobs
  synthesis            JSONB,
  steelman             JSONB,
  rewrite              JSONB
);

CREATE TABLE persona_results (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id     UUID        NOT NULL REFERENCES research_runs(id) ON DELETE CASCADE,
  persona_id TEXT        NOT NULL,
  result     JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Fast product history lookups
CREATE INDEX idx_research_runs_product_id ON research_runs(product_id, created_at DESC);
-- Fast persona result lookups per run
CREATE INDEX idx_persona_results_run_id   ON persona_results(run_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Every table is scoped to auth.uid() — anonymous users are fully isolated
-- from each other because each gets a unique UUID from Supabase auth.

ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_runs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_results ENABLE ROW LEVEL SECURITY;

-- products: users own their rows
CREATE POLICY "own products"
  ON products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- research_runs: users own their rows
CREATE POLICY "own runs"
  ON research_runs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- persona_results: access granted if the parent run belongs to the user
CREATE POLICY "own persona results"
  ON persona_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM research_runs
      WHERE research_runs.id = persona_results.run_id
        AND research_runs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM research_runs
      WHERE research_runs.id = persona_results.run_id
        AND research_runs.user_id = auth.uid()
    )
  );

-- ─── Auto-update updated_at on products ──────────────────────────────────────

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
