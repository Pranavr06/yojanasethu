-- Migration: 20261023_certificate_assessment_workflow.sql
-- Description: Complete Certificate Assessment, Scoring, Mentor Verification Desk, and Retake Schema

-- 1. Extend evidence_submissions with assessment and retake audit tracking
ALTER TABLE IF EXISTS public.evidence_submissions
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS assessment_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS attempts_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_attempts_allowed INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS can_retake BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retake_feedback TEXT,
  ADD COLUMN IF NOT EXISTS retake_granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS retake_granted_at TIMESTAMPTZ;

-- 2. Create normalized certificate_assessments table
CREATE TABLE IF NOT EXISTS public.certificate_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.evidence_submissions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  attempt_number INT NOT NULL DEFAULT 1,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ question_id, student_answer, is_correct }]
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'evaluated')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT chk_attempt_number CHECK (attempt_number BETWEEN 1 AND 2)
);

-- 3. Link student_skill_passport to evidence submission source
ALTER TABLE IF EXISTS public.student_skill_passport
  ADD COLUMN IF NOT EXISTS evidence_submission_id UUID REFERENCES public.evidence_submissions(id) ON DELETE SET NULL;

-- 4. High-performance querying indexes
CREATE INDEX IF NOT EXISTS idx_cert_assessments_sub ON public.certificate_assessments(submission_id);
CREATE INDEX IF NOT EXISTS idx_cert_assessments_student ON public.certificate_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sub_student_status ON public.evidence_submissions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_evidence_sub_retake ON public.evidence_submissions(can_retake);

-- 5. Enable Row-Level Security
ALTER TABLE public.certificate_assessments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for certificate_assessments
DROP POLICY IF EXISTS "Students can view own assessments" ON public.certificate_assessments;
CREATE POLICY "Students can view own assessments"
  ON public.certificate_assessments
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('mentor', 'faculty', 'admin', 'placements')
    )
  );

DROP POLICY IF EXISTS "Students can insert own assessments" ON public.certificate_assessments;
CREATE POLICY "Students can insert own assessments"
  ON public.certificate_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Mentors and admins can view all assessments" ON public.certificate_assessments;
CREATE POLICY "Mentors and admins can view all assessments"
  ON public.certificate_assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('mentor', 'faculty', 'admin')
    )
  );
