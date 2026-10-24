-- ========================================================
-- YojanaSethu: Mentor-Mentee Allocation & 12-Mentee Limit Gate
-- ========================================================

-- 1. Extend profiles with mentor_id column
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_mentor_id ON public.profiles(mentor_id);

-- 2. Create dedicated mentor_assignments table
CREATE TABLE IF NOT EXISTS public.mentor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(student_id)
);

CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor ON public.mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_student ON public.mentor_assignments(student_id);

-- 3. Strict 12-Mentee Capacity Enforcement Function & Trigger
CREATE OR REPLACE FUNCTION check_mentor_mentee_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.mentor_assignments
  WHERE mentor_id = NEW.mentor_id AND student_id != NEW.student_id;

  IF current_count >= 12 THEN
    RAISE EXCEPTION 'Mentor % has reached maximum capacity of 12 mentees as per institutional placement policy.', NEW.mentor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_mentor_mentee_limit ON public.mentor_assignments;
CREATE TRIGGER trg_check_mentor_mentee_limit
BEFORE INSERT OR UPDATE ON public.mentor_assignments
FOR EACH ROW EXECUTE FUNCTION check_mentor_mentee_limit();

-- 4. Enable Row Level Security
ALTER TABLE public.mentor_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for authenticated campus users" ON public.mentor_assignments;
CREATE POLICY "Public read access for authenticated campus users"
ON public.mentor_assignments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Placement Cell and Admin manage mentor assignments" ON public.mentor_assignments;
CREATE POLICY "Placement Cell and Admin manage mentor assignments"
ON public.mentor_assignments FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('placements', 'placement', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('placements', 'placement', 'admin')
  )
);
