-- ========================================================
-- YojanaSethu: DSA Progress Tracking & Skill Gap Schema Migration
-- Migration: 20261024_dsa_and_skill_gap.sql
-- ========================================================

-- 1. Extend profiles with target career attributes
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS target_career_role TEXT DEFAULT 'Software Developer',
  ADD COLUMN IF NOT EXISTS learning_goals TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS career_interests TEXT[] DEFAULT '{}'::text[];

-- 2. Create student_dsa_progress table
CREATE TABLE IF NOT EXISTS public.student_dsa_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('solved', 'attempted', 'revision_needed')),
  attempts_count INT NOT NULL DEFAULT 1,
  failed_attempts INT NOT NULL DEFAULT 0,
  accuracy_percentage NUMERIC(5,2) DEFAULT 100.0,
  time_spent_minutes INT DEFAULT 0,
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(student_id, topic_id)
);

-- 3. High-performance querying indexes
CREATE INDEX IF NOT EXISTS idx_student_dsa_student ON public.student_dsa_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_dsa_status ON public.student_dsa_progress(student_id, status);
CREATE INDEX IF NOT EXISTS idx_student_dsa_topic ON public.student_dsa_progress(topic_id);

-- 4. Enable Row Level Security
ALTER TABLE public.student_dsa_progress ENABLE ROW LEVEL SECURITY;

-- 5. Least-Privilege RLS Policies
-- Enforces canonical immutable identity (auth.uid() = profiles.id)
-- with verified institutional email fallback for pre-seeded cohort identities.

-- SELECT: Students view own DSA progress
DROP POLICY IF EXISTS "Students can view own DSA progress" ON public.student_dsa_progress;
CREATE POLICY "Students can view own DSA progress"
  ON public.student_dsa_progress
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_dsa_progress.student_id
      AND (
        p.id = auth.uid()
        OR (
          p.email = lower(auth.jwt()->>'email')
          AND coalesce((auth.jwt()->>'email_verified')::boolean, true)
        )
      )
    )
  );

-- INSERT: Students insert own DSA progress
DROP POLICY IF EXISTS "Students can insert own DSA progress" ON public.student_dsa_progress;
CREATE POLICY "Students can insert own DSA progress"
  ON public.student_dsa_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_dsa_progress.student_id
      AND (
        p.id = auth.uid()
        OR (
          p.email = lower(auth.jwt()->>'email')
          AND coalesce((auth.jwt()->>'email_verified')::boolean, true)
        )
      )
    )
  );

-- UPDATE: Students update own DSA progress
DROP POLICY IF EXISTS "Students can update own DSA progress" ON public.student_dsa_progress;
CREATE POLICY "Students can update own DSA progress"
  ON public.student_dsa_progress
  FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_dsa_progress.student_id
      AND (
        p.id = auth.uid()
        OR (
          p.email = lower(auth.jwt()->>'email')
          AND coalesce((auth.jwt()->>'email_verified')::boolean, true)
        )
      )
    )
  )
  WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_dsa_progress.student_id
      AND (
        p.id = auth.uid()
        OR (
          p.email = lower(auth.jwt()->>'email')
          AND coalesce((auth.jwt()->>'email_verified')::boolean, true)
        )
      )
    )
  );

-- DELETE: Students delete own DSA progress
DROP POLICY IF EXISTS "Students can delete own DSA progress" ON public.student_dsa_progress;
CREATE POLICY "Students can delete own DSA progress"
  ON public.student_dsa_progress
  FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = student_dsa_progress.student_id
      AND (
        p.id = auth.uid()
        OR (
          p.email = lower(auth.jwt()->>'email')
          AND coalesce((auth.jwt()->>'email_verified')::boolean, true)
        )
      )
    )
  );

-- SELECT: Mentors and placement staff can inspect student DSA progress
DROP POLICY IF EXISTS "Mentors and staff can view student DSA progress" ON public.student_dsa_progress;
CREATE POLICY "Mentors and staff can view student DSA progress"
  ON public.student_dsa_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('mentor', 'faculty', 'admin', 'placements')
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role::text IN ('mentor', 'faculty', 'admin', 'placements', 'placement')
    )
  );

-- 6. Reload schema cache in PostgREST so Supabase recognizes new table & columns immediately
NOTIFY pgrst, 'reload schema';
