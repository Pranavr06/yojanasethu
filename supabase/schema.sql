-- ========================================================
-- PathPilot Database Schema (PostgreSQL / Supabase)
-- Event: Nexathon 2026 | Team: Team Neural Forge
-- "Resumes show what students claim. PathPilot shows what they can prove."
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES (Role-Based Access)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'mentor', 'recruiter', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SKILLS DIRECTORY
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('programming', 'framework', 'database', 'cloud_devops', 'ai_ml', 'core_cs', 'soft_skill')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INDUSTRY ROLES / PROFILES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    min_cgpa_recommended NUMERIC(4,2) DEFAULT 7.0,
    required_skills JSONB NOT NULL, -- Array of { skill_id, skill_name, importance: 'mandatory' | 'preferred', weight: number }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STUDENTS (Academic & Profile Core)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    usn VARCHAR(50) UNIQUE NOT NULL,
    college VARCHAR(255) DEFAULT 'NMAM Institute of Technology, Nitte',
    branch VARCHAR(50) NOT NULL, -- 'ISE', 'CSE', 'AIML', 'ECE'
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 8),
    grad_year INTEGER NOT NULL,
    current_cgpa NUMERIC(4,2) NOT NULL CHECK (current_cgpa BETWEEN 0 AND 10),
    target_cgpa NUMERIC(4,2) NOT NULL CHECK (target_cgpa BETWEEN 0 AND 10),
    completed_credits INTEGER NOT NULL DEFAULT 120,
    total_credits INTEGER NOT NULL DEFAULT 160,
    active_backlogs INTEGER NOT NULL DEFAULT 0,
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    discoverable BOOLEAN NOT NULL DEFAULT true, -- Privacy control: Student controls recruiter visibility
    bio TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. STUDENT SKILLS & EVIDENCE WITH FACULTY MENTOR VERIFICATION GATE
-- Status Lifecycle: 'self_declared' -> 'pending_approval' -> 'evidenced' (or 'rejected')
CREATE TABLE IF NOT EXISTS student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'self_declared' CHECK (status IN ('self_declared', 'pending_approval', 'evidenced', 'rejected')),
    proficiency_level VARCHAR(20) DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    evidence_title VARCHAR(255),
    evidence_url TEXT, -- GitHub repo, live app URL, or verified credential
    evidence_type VARCHAR(50) CHECK (evidence_type IN ('github_repo', 'live_project', 'assessment', 'certificate')),
    submission_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Mentor who reviewed & approved
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, skill_id)
);

-- 6. STUDENT PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    repo_url TEXT,
    live_url TEXT,
    skills_used JSONB DEFAULT '[]', -- array of skill names
    is_mentor_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RECRUITER JOB REQUIREMENTS & DRIVES
CREATE TABLE IF NOT EXISTS job_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 7.0,
    target_grad_year INTEGER NOT NULL,
    allowed_branches TEXT[] NOT NULL, -- e.g. ARRAY['ISE', 'CSE', 'AIML']
    max_backlogs INTEGER NOT NULL DEFAULT 0,
    required_skills JSONB NOT NULL, -- [{ name: "Python", min_status: "evidenced", weight: 2 }]
    job_type VARCHAR(50) DEFAULT 'Internship' CHECK (job_type IN ('Internship', 'Full-time', 'Intern + FTE')),
    stipend_or_ctc VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 30-DAY PERSONALIZED LEARNING ROADMAPS
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    target_role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 4),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_items JSONB NOT NULL, -- array of strings
    resource_urls JSONB DEFAULT '[]', -- array of { title, url, type }
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MENTOR MENTEE RELATIONSHIP & INTERVENTIONS
CREATE TABLE IF NOT EXISTS mentor_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, student_id)
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_status ON student_skills(status);
CREATE INDEX IF NOT EXISTS idx_students_branch_cgpa ON students(branch, current_cgpa);
CREATE INDEX IF NOT EXISTS idx_job_requirements_active ON job_requirements(is_active);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Allow public read for hackathon demo convenience / authenticated users
CREATE POLICY "Public read students" ON students FOR SELECT USING (true);
CREATE POLICY "Public read student_skills" ON student_skills FOR SELECT USING (true);
CREATE POLICY "Public update student_skills" ON student_skills FOR UPDATE USING (true);
CREATE POLICY "Public insert student_skills" ON student_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read job_requirements" ON job_requirements FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Public read roadmaps" ON roadmaps FOR SELECT USING (true);
