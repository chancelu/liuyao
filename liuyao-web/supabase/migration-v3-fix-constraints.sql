-- ============================================================
-- Fix: Add unique constraints for upsert operations
-- Run in Supabase SQL Editor
-- ============================================================

-- casts table: add unique constraint on divination_id
-- (each divination should have exactly one cast record)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'casts_divination_id_key'
  ) THEN
    ALTER TABLE public.casts ADD CONSTRAINT casts_divination_id_key UNIQUE (divination_id);
  END IF;
END $$;

-- readings table: add unique constraint on divination_id
-- (each divination should have exactly one reading record)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'readings_divination_id_key'
  ) THEN
    ALTER TABLE public.readings ADD CONSTRAINT readings_divination_id_key UNIQUE (divination_id);
  END IF;
END $$;

-- Also ensure divinations table allows update by service role
-- (for saveForUser and markPublic operations)
-- The existing "service_role_full_access" policy should cover this,
-- but let's add an explicit update policy just in case:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'divinations' AND policyname = 'allow_update_divinations'
  ) THEN
    CREATE POLICY "allow_update_divinations"
      ON public.divinations FOR UPDATE
      USING (true) WITH CHECK (true);
  END IF;
END $$;
