// ========================================================
// PathPilot TypeScript Types (Exact 1:1 Mapping to Supabase Schema)
// Event: Nexathon 2026 | Team: Team Neural Forge
// ========================================================

export type UserRole = 'student' | 'faculty' | 'recruiter' | 'placement' | 'admin';
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type EvidenceType = 'github_repo' | 'live_project' | 'assessment' | 'certificate';
export type EvidenceTier = 'self_declared' | 'evidenced' | 'expert';
export type ApplicationStage = 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected';

export interface PlacementStats {
  total_companies: number;
  active_drives: number;
  total_offers: number;
  highest_package_lpa: number;
  average_package_lpa: number;
  placement_percentage: number;
  department_stats: {
    department_code: string;
    department_name: string;
    total_students: number;
    eligible_students: number;
    placed_students: number;
    average_cgpa: number;
    placement_rate: number;
  }[];
}

export interface Institution {
  id: string;
  name: string;
  short_name: string;
  code: string;
  slug: string;
  website?: string | null;
  logo_url?: string | null;
  accreditation?: string | null;
  is_active: boolean;
}

export interface Department {
  id: string;
  institution_id: string;
  code: string; // 'ISE', 'CSE', 'AIML'
  name: string;
  hod_name?: string | null;
  total_intake: number;
}

export interface Profile {
  id: string;
  institution_id: string;
  department_id?: string | null;
  department_code?: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  usn?: string | null;
  semester?: number | null;
  graduation_year?: number | null;
  github_username?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  recruiter_consent: boolean;
  designation?: string | null;
  assigned_specializations?: string[] | null;
  company_name?: string | null;
  recruiter_title?: string | null;
  created_at?: string;
}

export interface AcademicRecord {
  id: string;
  institution_id: string;
  student_id: string;
  usn: string;
  batch: string;
  cgpa: number;
  total_earned_credits: number;
  active_backlogs: number;
  history_of_backlogs: number;
  source_system: string; // 'NMAMIT Autonomous Examination Cell (Contineo ERP)'
  last_verified_at?: string;
  is_verified_by_exam_cell: boolean;
}

export interface SemesterMark {
  id: string;
  academic_record_id: string;
  semester: number;
  sgpa: number;
  credits_registered: number;
  credits_earned: number;
  backlogs: number;
  exam_month_year: string;
}

export interface StudentSkillPassport {
  id: string;
  student_id: string;
  skill_name: string;
  category: string;
  tier: EvidenceTier;
  confidence_score?: number | null;
  evidence_source: string;
  evidence_date: string;
  verification_badge: boolean;
  evidence_url?: string | null;
  verified_by_name?: string | null;
  verified_at?: string | null;
}

export interface EvidenceSubmission {
  id: string;
  institution_id: string;
  student_id: string;
  title: string;
  type: EvidenceType;
  description: string;
  issue_date: string;
  issuer_or_organization: string;
  credential_url?: string | null;
  document_storage_path?: string | null;
  technologies: string[];
  associated_skills: string[];
  github_repo_url?: string | null;
  live_demo_url?: string | null;
  claimed_role?: string | null;
  team_size: number;
  status: VerificationStatus;
  faculty_feedback?: string | null;
  rejection_reason?: string | null;
  submitted_at: string;
  updated_at?: string;
  // Joined fields for display
  student_name?: string;
  student_usn?: string;
  student_branch?: string;
}

export interface VerificationReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  status: VerificationStatus;
  decision_reason?: string | null;
  faculty_comment?: string | null;
  reviewed_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  industry?: string | null;
  tier?: string;
  headquarters?: string | null;
}

export interface PlacementDrive {
  id: string;
  institution_id: string;
  company_id: string;
  company_name?: string;
  role_title: string;
  ctc_lpa: number;
  stipend_per_month?: number | null;
  job_location: string;
  job_description: string;
  eligible_branches: string[];
  min_cgpa: number;
  max_active_backlogs: number;
  batch_year: number;
  recruitment_status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  registration_deadline: string;
  required_skills?: {
    name: string;
    importance: 'mandatory' | 'preferred';
    weight: number;
  }[];
}

export interface DriveApplication {
  id: string;
  drive_id: string;
  student_id: string;
  stage: ApplicationStage;
  notes?: string | null;
  applied_at: string;
}

export interface Roadmap {
  id: string;
  student_id: string;
  target_role: string;
  week_number: number;
  title: string;
  description: string;
  action_items: string[];
  resource_urls: {
    title: string;
    url: string;
    type: 'video' | 'interactive' | 'course' | 'documentation';
  }[];
  is_completed: boolean;
  created_at?: string;
}

// Full view model for Student Dashboard
export interface FullStudentProfile {
  profile: Profile;
  academic_record: AcademicRecord | null;
  semester_marks: SemesterMark[];
  skills: StudentSkillPassport[];
  evidence_submissions: EvidenceSubmission[];
  roadmaps: Roadmap[];
  target_role: string;
}

// Recruiter Candidate Evaluation Result
export interface CandidateEvaluation {
  student: FullStudentProfile;
  is_eligible: boolean;
  disqualification_reason?: string;
  match_score: number; // 0 - 100
  verified_count: number;
  claimed_count: number;
  missing_count: number;
  skill_breakdown: {
    skill_name: string;
    required_importance: 'mandatory' | 'preferred';
    weight: number;
    tier: EvidenceTier | 'missing';
    verification_badge: boolean;
    evidence_url?: string | null;
    status: 'verified' | 'claimed' | 'missing';
  }[];
  explanation: string;
}

// Cohort Gap Visual Model for Recharts
export interface CohortSkillMetric {
  skill_name: string;
  category: string;
  verified_count: number;
  pending_count: number;
  self_declared_count: number;
  missing_count: number;
  total_students: number;
  gap_percentage: number;
}
