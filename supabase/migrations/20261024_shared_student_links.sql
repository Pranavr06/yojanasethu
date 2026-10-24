-- ============================================================================
-- YOJANASETHU: SHARED PROFILE LINKS & LINKS ANALYZER PERSISTENCE
-- Migration: 20261024_shared_student_links.sql
-- ============================================================================

-- 1. Extend profiles table with explicit LeetCode and coding profile URLs
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS leetcode_url TEXT,
  ADD COLUMN IF NOT EXISTS coding_profile_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT;

-- 2. Create student_links_analysis table for storing structured AI analysis reports
CREATE TABLE IF NOT EXISTS public.student_links_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  target_job_description TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  leetcode_url TEXT,
  analysis_report JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_links_analysis_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_links_analysis_student_id ON public.student_links_analysis(student_id);

-- 3. Enable Row Level Security
ALTER TABLE public.student_links_analysis ENABLE ROW LEVEL SECURITY;

-- Policy 1: Students can view their own links analysis
CREATE POLICY "Students can view their own links analysis"
  ON public.student_links_analysis
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'mentor', 'faculty')
    )
  );

-- Policy 2: Students can insert their own links analysis
CREATE POLICY "Students can insert their own links analysis"
  ON public.student_links_analysis
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy 3: Students can update their own links analysis
CREATE POLICY "Students can update their own links analysis"
  ON public.student_links_analysis
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Policy 4: Students can delete their own links analysis
CREATE POLICY "Students can delete their own links analysis"
  ON public.student_links_analysis
  FOR DELETE
  USING (auth.uid() = student_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
