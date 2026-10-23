-- ============================================================================
-- YOJANASETHU: STUDENT RESUMES & AI ANALYSIS STORAGE TABLE
-- Migration: 20261024_resumes_table.sql
-- Supports: Private student resume storage, AI ATS analysis results, templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Technical Resume',
  target_role TEXT NOT NULL DEFAULT 'Full Stack Developer',
  target_job_description TEXT,
  template TEXT NOT NULL DEFAULT 'modern',
  resume_data JSONB NOT NULL,
  analysis_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by student
CREATE INDEX IF NOT EXISTS idx_student_resumes_student_id ON public.student_resumes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_resumes_updated_at ON public.student_resumes(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.student_resumes ENABLE ROW LEVEL SECURITY;

-- 1. Students can view only their own resumes (or college admins/placements)
CREATE POLICY "Students can view their own resumes"
  ON public.student_resumes
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'placement', 'placements')
    )
  );

-- 2. Students can insert their own resumes
CREATE POLICY "Students can create their own resumes"
  ON public.student_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- 3. Students can update their own resumes
CREATE POLICY "Students can update their own resumes"
  ON public.student_resumes
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- 4. Students can delete their own resumes
CREATE POLICY "Students can delete their own resumes"
  ON public.student_resumes
  FOR DELETE
  USING (auth.uid() = student_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
