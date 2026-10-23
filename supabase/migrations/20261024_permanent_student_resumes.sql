-- ============================================================================
-- YOJANASETHU: PERMANENT STUDENT RESUME STORAGE & MULTI-DASHBOARD ACCESS
-- Migration: 20261024_permanent_student_resumes.sql
-- ============================================================================

-- 1. Add permanent resume tracking columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resume_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS resume_file_name TEXT,
  ADD COLUMN IF NOT EXISTS resume_file_size TEXT,
  ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMPTZ;

-- 2. Create dedicated student_uploaded_resumes table for permanent record keeping
CREATE TABLE IF NOT EXISTS public.student_uploaded_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size TEXT,
  content_type TEXT DEFAULT 'application/pdf',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_uploaded_resumes_student UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_uploaded_resumes_student_id ON public.student_uploaded_resumes(student_id);

-- 3. Enable Row Level Security
ALTER TABLE public.student_uploaded_resumes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authorized view (Student themselves, mentors, placement staff, recruiters, admins)
CREATE POLICY "Authorized users can view student resumes"
  ON public.student_uploaded_resumes
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('admin', 'mentor', 'faculty', 'placement', 'placements', 'recruiter')
    )
  );

-- Policy 2: Students can insert their own resume
CREATE POLICY "Students can upload their own resume"
  ON public.student_uploaded_resumes
  FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Policy 3: Students can update/replace their own resume
CREATE POLICY "Students can replace their own resume"
  ON public.student_uploaded_resumes
  FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Policy 4: Students can delete their own resume
CREATE POLICY "Students can delete their own resume"
  ON public.student_uploaded_resumes
  FOR DELETE
  USING (auth.uid() = student_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
