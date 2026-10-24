-- ============================================================================
-- Migration: 20261023_academic_career_coach_and_dsa.sql
-- Description: Schema for Academic Improvement Engine, Curated Resources,
--              Adaptive DSA Tracking, Company Prep, and Unified Roadmaps.
-- ============================================================================

-- 1. Student Academic Subject Records (Subject-level marks, grades, attendance, exam dates)
CREATE TABLE IF NOT EXISTS public.student_academic_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_code VARCHAR(50) NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  department VARCHAR(50) NOT NULL DEFAULT 'ISE',
  credits INT NOT NULL DEFAULT 4,
  internal_marks NUMERIC(5,2) NOT NULL DEFAULT 0, -- Continuous Internal Evaluation (CIE) out of 50
  external_marks NUMERIC(5,2) NOT NULL DEFAULT 0, -- Semester End Examination (SEE) out of 50
  total_marks NUMERIC(5,2) NOT NULL DEFAULT 0,    -- Total score out of 100
  grade VARCHAR(5) NOT NULL DEFAULT 'F' CHECK (grade IN ('S', 'A', 'B', 'C', 'D', 'E', 'F')),
  grade_points NUMERIC(4,2) NOT NULL DEFAULT 0,
  attendance_pct NUMERIC(5,2) NOT NULL DEFAULT 85.00,
  is_backlog BOOLEAN NOT NULL DEFAULT false,
  upcoming_exam_date DATE,
  syllabus_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_student_subject UNIQUE (student_id, subject_code, semester)
);

CREATE INDEX IF NOT EXISTS idx_subj_student_sem ON public.student_academic_subjects(student_id, semester);
CREATE INDEX IF NOT EXISTS idx_subj_backlog ON public.student_academic_subjects(is_backlog);

-- 2. Curated Learning Resources (YouTube Lessons, Playlists, Search Fallbacks)
CREATE TABLE IF NOT EXISTS public.curated_learning_resources (
  id VARCHAR(100) PRIMARY KEY,
  subject_code VARCHAR(50) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  channel_name VARCHAR(150) NOT NULL,
  resource_url TEXT NOT NULL,
  playlist_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 15,
  verification_status VARCHAR(50) NOT NULL CHECK (verification_status IN ('verified_video', 'verified_playlist', 'search_fallback')),
  verification_label VARCHAR(150) NOT NULL,
  retrieval_date DATE NOT NULL DEFAULT CURRENT_DATE,
  semester INT NOT NULL DEFAULT 4,
  difficulty VARCHAR(50) NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  in_app_destination_url TEXT NOT NULL,
  linked_quiz_subject VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_curated_subj_topic ON public.curated_learning_resources(subject_code, topic);

-- 3. DSA Problems Catalog (Verified Historical, Frequently Reported, AI-Generated)
CREATE TABLE IF NOT EXISTS public.dsa_problems (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('High', 'Very High', 'Critical')),
  core_pattern VARCHAR(255) NOT NULL,
  category_type VARCHAR(50) NOT NULL DEFAULT 'frequently_reported' CHECK (category_type IN ('verified_historical', 'frequently_reported', 'ai_generated')),
  target_companies TEXT[] NOT NULL DEFAULT '{}'::text[],
  target_role VARCHAR(150) NOT NULL DEFAULT 'SDE-1',
  statement TEXT NOT NULL,
  constraints TEXT[] NOT NULL DEFAULT '{}'::text[],
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints TEXT[] NOT NULL DEFAULT '{}'::text[],
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
  reference_solution JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_complexity VARCHAR(100) NOT NULL,
  space_complexity VARCHAR(100) NOT NULL,
  source_attribution TEXT,
  source_url TEXT,
  reported_date DATE,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  prerequisites TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_dsa_cat_diff ON public.dsa_problems(category, difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_type ON public.dsa_problems(category_type);

-- 4. Student DSA Attempts & Mastery Log
CREATE TABLE IF NOT EXISTS public.student_dsa_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id VARCHAR(100) NOT NULL REFERENCES public.dsa_problems(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('solved', 'attempted', 'failed')),
  code TEXT NOT NULL,
  language VARCHAR(30) NOT NULL DEFAULT 'python',
  test_results JSONB NOT NULL DEFAULT '{"passed":0, "total":0}'::jsonb,
  time_taken_seconds INT NOT NULL DEFAULT 0,
  hints_used INT NOT NULL DEFAULT 0,
  attempts_count INT NOT NULL DEFAULT 1,
  viewed_solution BOOLEAN NOT NULL DEFAULT false,
  mastery_score INT NOT NULL DEFAULT 0 CHECK (mastery_score BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_student_problem_attempt UNIQUE (student_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_dsa_attempts_student ON public.student_dsa_attempts(student_id, status);

-- 5. Student Company Preparation Goals
CREATE TABLE IF NOT EXISTS public.student_company_prep_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_companies TEXT[] NOT NULL DEFAULT '{}'::text[],
  target_role VARCHAR(150) NOT NULL DEFAULT 'Software Development Engineer (SDE-1)',
  placement_deadline DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '60 days'),
  daily_prep_minutes INT NOT NULL DEFAULT 60,
  readiness_score INT NOT NULL DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_student_prep_goal UNIQUE (student_id)
);

-- 6. Unified Roadmap Action Tasks (Academic + Placement + Mock Interview Milestones)
CREATE TABLE IF NOT EXISTS public.unified_roadmap_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 8),
  category VARCHAR(50) NOT NULL CHECK (category IN ('academic_priority', 'adaptive_dsa', 'company_prep', 'video_lesson', 'mock_interview', 'revision')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_minutes INT NOT NULL DEFAULT 45,
  completion_criteria TEXT NOT NULL,
  action_destination_url TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  evidence_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT uq_student_day_task UNIQUE (student_id, day_number, category, title)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_student_week ON public.unified_roadmap_tasks(student_id, week_number);

-- Enable RLS
ALTER TABLE public.student_academic_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_dsa_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_company_prep_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unified_roadmap_tasks ENABLE ROW LEVEL SECURITY;

-- Permissive demo / authenticated access policies
CREATE POLICY "Public read academic subjects" ON public.student_academic_subjects FOR SELECT USING (true);
CREATE POLICY "Public update academic subjects" ON public.student_academic_subjects FOR UPDATE USING (true);
CREATE POLICY "Public insert academic subjects" ON public.student_academic_subjects FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read curated resources" ON public.curated_learning_resources FOR SELECT USING (true);
CREATE POLICY "Public read dsa problems" ON public.dsa_problems FOR SELECT USING (true);
CREATE POLICY "Public insert dsa problems" ON public.dsa_problems FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read dsa attempts" ON public.student_dsa_attempts FOR SELECT USING (true);
CREATE POLICY "Public upsert dsa attempts" ON public.student_dsa_attempts FOR ALL USING (true);

CREATE POLICY "Public read company goals" ON public.student_company_prep_goals FOR SELECT USING (true);
CREATE POLICY "Public upsert company goals" ON public.student_company_prep_goals FOR ALL USING (true);

CREATE POLICY "Public read unified roadmap" ON public.unified_roadmap_tasks FOR SELECT USING (true);
CREATE POLICY "Public update unified roadmap" ON public.unified_roadmap_tasks FOR UPDATE USING (true);
