-- Migration: 20261023_placement_transparency_hub.sql
-- Description: Placement Transparency Hub schema with Placement Announcements, In-App Notifications, and RBAC policies

-- 1. Create placement_announcements table
CREATE TABLE IF NOT EXISTS placement_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL DEFAULT '11111111-0000-0000-0000-000000000001',
  drive_id UUID REFERENCES placement_drives(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  role_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'Full-time',
  employment_details TEXT,
  ctc_lpa NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  ctc_breakdown JSONB DEFAULT '{}'::jsonb,
  eligible_branches TEXT[] NOT NULL DEFAULT '{}',
  eligible_batches INT[] NOT NULL DEFAULT '{}',
  min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  max_active_backlogs INT NOT NULL DEFAULT 0,
  allow_history_of_backlogs BOOLEAN NOT NULL DEFAULT true,
  required_skills JSONB DEFAULT '[]'::jsonb,
  registration_open_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ NOT NULL,
  ppt_date TIMESTAMPTZ,
  assessment_date TIMESTAMPTZ,
  interview_date TIMESTAMPTZ,
  application_link TEXT,
  official_source_ref TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Training & Placement Cell, NMAMIT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Create in_app_notifications table
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_target TEXT DEFAULT 'all',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'announcement' CHECK (type IN ('announcement', 'deadline', 'drive', 'system')),
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_announcements_status ON placement_announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_deadline ON placement_announcements(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON placement_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_batches ON placement_announcements USING GIN(eligible_batches);
CREATE INDEX IF NOT EXISTS idx_announcements_branches ON placement_announcements USING GIN(eligible_branches);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON in_app_notifications(user_id, is_read);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE placement_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for placement_announcements
-- Anyone (students, mentors, recruiters, public) can view published, closed, or archived announcements
CREATE POLICY "Public can view published or concluded announcements"
ON placement_announcements
FOR SELECT
USING (
  status IN ('published', 'closed', 'archived')
  OR auth.jwt()->>'role' IN ('placements', 'placement', 'admin')
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('placements', 'placement', 'admin')
  )
);

-- Authorized TPO/Placement Officers and Admins can create announcements
CREATE POLICY "Placement Officers and Admins can insert announcements"
ON placement_announcements
FOR INSERT
WITH CHECK (
  auth.jwt()->>'role' IN ('placements', 'placement', 'admin')
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('placements', 'placement', 'admin')
  )
);

-- Authorized TPO/Placement Officers and Admins can update announcements
CREATE POLICY "Placement Officers and Admins can update announcements"
ON placement_announcements
FOR UPDATE
USING (
  auth.jwt()->>'role' IN ('placements', 'placement', 'admin')
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('placements', 'placement', 'admin')
  )
);

-- Authorized TPO/Placement Officers and Admins can delete announcements
CREATE POLICY "Placement Officers and Admins can delete announcements"
ON placement_announcements
FOR DELETE
USING (
  auth.jwt()->>'role' IN ('placements', 'placement', 'admin')
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('placements', 'placement', 'admin')
  )
);

-- 6. RLS Policies for in_app_notifications
CREATE POLICY "Users can view their own notifications"
ON in_app_notifications
FOR SELECT
USING (
  user_id = auth.uid()
  OR role_target = 'all'
  OR role_target = (
    SELECT role FROM profiles WHERE profiles.id = auth.uid()
  )
);

CREATE POLICY "Users can update read status on their notifications"
ON in_app_notifications
FOR UPDATE
USING (user_id = auth.uid() OR role_target = 'all');
