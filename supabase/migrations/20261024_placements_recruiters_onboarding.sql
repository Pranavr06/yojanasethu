-- Migration: 20261024_placements_recruiters_onboarding.sql
-- Description: Placements Department Recruiter Onboarding & Company Linkage

-- 1. Ensure user_role_enum supports recruiter & placements
DO $$
BEGIN
  ALTER TYPE public.user_role_enum ADD VALUE IF NOT EXISTS 'recruiter';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

DO $$
BEGIN
  ALTER TYPE public.user_role_enum ADD VALUE IF NOT EXISTS 'placements';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

-- 2. Ensure companies table exists with comprehensive company metadata
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  website VARCHAR(500),
  industry VARCHAR(150),
  tier VARCHAR(50) DEFAULT 'Tier 1',
  headquarters VARCHAR(150),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Extend profiles table with recruiter and company columns if missing
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS recruiter_title TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT;

-- 4. Indexes for fast company and recruiter lookups
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_profiles_role_company ON public.profiles(role, company_id);

-- 5. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
