// ========================================================
// YojanaSethu TypeScript Types (Exact 1:1 Mapping to Supabase Schema)
// Event: Nexathon 2026 | Team: Team Neural Forge
// ========================================================

export type UserRole = 'student' | 'faculty' | 'mentor' | 'recruiter' | 'placement' | 'placements' | 'admin';
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'pending_assessment' | 'retake_granted';
export type EvidenceType = 'project' | 'certificate' | 'internship' | 'hackathon' | 'github_repo' | 'live_project' | 'assessment';
export type EvidenceTier = 'self_declared' | 'evidenced' | 'expert' | 'faculty_verified';
export type ApplicationStage = 'applied' | 'shortlisted' | 'interview_scheduled' | 'selected' | 'rejected';

export interface AcademicCorrectionRequest {
  id: string;
  student_id: string;
  subject_or_semester: string;
  claimed_value: string;
  official_value: string;
  reason: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  submitted_at: string;
  resolved_at?: string | null;
  admin_notes?: string | null;
  student_name?: string;
  student_usn?: string;
  student_branch?: string;
  subject?: string | null;
  assessment_score?: number | null;
  attempts_count?: number;
  max_attempts_allowed?: number;
  can_retake?: boolean;
  retake_feedback?: string | null;
  retake_granted_by?: string | null;
  retake_granted_at?: string | null;
  latest_assessment?: CertificateAssessment | null;
}

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
  recruiter_consent?: boolean;
  designation?: string | null;
  assigned_specializations?: string[] | null;
  company_name?: string | null;
  recruiter_title?: string | null;
  target_career_role?: string | null;
  learning_goals?: string[] | null;
  career_interests?: string[] | null;
  created_at?: string;
  updated_at?: string;
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
  subject?: string | null;
  assessment_score?: number | null;
  attempts_count?: number;
  max_attempts_allowed?: number;
  can_retake?: boolean;
  retake_feedback?: string | null;
  retake_granted_by?: string | null;
  retake_granted_at?: string | null;
  latest_assessment?: CertificateAssessment | null;
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

// --- PLACEMENT TRANSPARENCY HUB TYPES ---

export type AnnouncementStatus = 'draft' | 'published' | 'closed' | 'archived';
export type JobType = 'Full-time' | 'Internship' | 'Internship + Full-time' | 'Contract';

export interface CtcBreakdown {
  fixed_lpa?: number;
  variable_lpa?: number;
  joining_bonus_lpa?: number;
  stipend_per_month?: number;
  currency?: string;
  notes?: string;
}

export interface PlacementAnnouncement {
  id: string;
  institution_id: string;
  drive_id?: string | null;
  company_name: string;
  company_logo_url?: string | null;
  role_title: string;
  job_description: string;
  job_type: JobType;
  employment_details?: string | null;
  ctc_lpa: number;
  ctc_breakdown?: CtcBreakdown | null;
  eligible_branches: string[];
  eligible_batches: number[];
  min_cgpa: number;
  max_active_backlogs: number;
  allow_history_of_backlogs: boolean;
  required_skills: {
    name: string;
    importance: 'mandatory' | 'preferred';
    weight?: number;
  }[];
  registration_open_date?: string | null;
  registration_deadline: string;
  ppt_date?: string | null;
  assessment_date?: string | null;
  interview_date?: string | null;
  application_link?: string | null;
  official_source_ref?: string | null;
  status: AnnouncementStatus;
  created_by?: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export type EligibilityDecision =
  | 'eligible'
  | 'ineligible'
  | 'registration_not_open'
  | 'registration_closed'
  | 'unknown';

export interface AdvisoryEligibility {
  decision: EligibilityDecision;
  badgeLabel: string;
  badgeColor: 'emerald' | 'rose' | 'amber' | 'slate' | 'blue';
  isEligible: boolean;
  canApplyNow: boolean;
  reasons: string[];
  missingDataWarnings: string[];
  studentSnapshot: {
    cgpa?: number;
    backlogs?: number;
    branch?: string;
    batch?: number;
  };
}

export type PlacementEventType =
  | 'registration_deadline'
  | 'registration_open'
  | 'ppt'
  | 'assessment'
  | 'interview'
  | 'company_visit';

export interface PlacementCalendarEvent {
  id: string;
  announcement_id: string;
  title: string;
  company_name: string;
  role_title: string;
  event_type: PlacementEventType;
  date: string;
  location_or_link?: string | null;
  description?: string | null;
  status: AnnouncementStatus;
}

export interface InAppNotification {
  id: string;
  user_id?: string;
  role_target?: string;
  title: string;
  message: string;
  type: 'announcement' | 'deadline' | 'drive' | 'system';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface HistoricalRecruiterRecord {
  company_name: string;
  tier: string;
  roles_offered: string[];
  years_active: number[];
  total_placed: number;
  highest_package_lpa: number;
  average_package_lpa: number;
}

export interface HistoricalPlacementStats {
  reporting_period: string;
  total_students_placed: number;
  highest_package_lpa: number;
  average_package_lpa: number;
  median_package_lpa: number;
  recruiters_count: number;
  department_summary: {
    department_code: string;
    department_name: string;
    total_students: number;
    placed_students: number;
    placement_rate: number;
    average_package_lpa: number;
  }[];
  top_recruiters: HistoricalRecruiterRecord[];
}

// ============================================================================
// CERTIFICATE ASSESSMENT, VERIFICATION DESK & QR PASSPORT TYPES
// ============================================================================

export type AssessmentSubject =
  | 'python'
  | 'dsa'
  | 'cloud_aws'
  | 'machine_learning'
  | 'sql_databases'
  | 'web_development'
  | 'cybersecurity'
  | 'devops';

export interface AssessmentQuestion {
  id: string;
  subject: AssessmentSubject;
  question: string;
  options: string[];
}

export interface AssessmentQuestionServer extends AssessmentQuestion {
  correctOptionIndex: number;
  explanation: string;
  gradingRationale: string;
}

export interface StudentAnswerSubmission {
  questionId: string;
  selectedOptionIndex: number;
}

export interface GradedQuestionResult {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface CertificateAssessment {
  id: string;
  submission_id: string;
  student_id: string;
  subject: string;
  subject_label: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  attempt_number: number;
  max_attempts: number;
  can_retake: boolean;
  answers: GradedQuestionResult[];
  status: 'submitted' | 'evaluated';
  completed_at: string;
}

export interface MentorReviewDecision {
  submission_id: string;
  action: 'approve' | 'reject' | 'grant_retake';
  rejection_reason?: string;
  retake_feedback?: string;
  reviewer_name?: string;
  reviewer_id?: string;
}

export interface VerifiedCredentialSummary {
  id: string;
  submission_id?: string;
  title: string;
  skill_name: string;
  subject: string;
  subject_label?: string;
  issuer: string;
  issue_date: string;
  verified_at: string;
  verified_by: string;
  assessment_score: number;
  verification_badge: boolean;
  credential_url?: string | null;
}

// ========================================================
// DSA PROGRESS & SKILL GAP ANALYZER TYPES
// ========================================================

export interface StudentDsaProgress {
  id?: string;
  student_id: string;
  topic_id: string;
  status: 'solved' | 'attempted' | 'revision_needed';
  attempts_count: number;
  failed_attempts: number;
  accuracy_percentage: number;
  time_spent_minutes: number;
  last_practiced_at: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type TargetCareerRole = 'Software Developer' | 'AI/ML Engineer' | 'Cybersecurity Analyst';

export type SkillStatus = 'verified_strength' | 'demonstrated_gap' | 'unassessed_missing';
export type SkillPriority = 'critical' | 'high' | 'medium';

export interface EvaluatedSkill {
  skill_name: string;
  category: string;
  status: SkillStatus;
  priority: SkillPriority;
  required_level: 'foundational' | 'intermediate' | 'advanced';
  demonstrated_level: 'none' | 'foundational' | 'intermediate' | 'advanced';
  weight: number;
  importance: 'mandatory' | 'preferred';
  evidence_summary: string;
  reason: string;
  recommended_action?: {
    activity: string;
    resource_title: string;
    resource_url: string;
    resource_type: 'practice' | 'project' | 'course' | 'doc';
    measurable_completion_criterion: string;
  };
}

export interface DsaPatternMetrics {
  total_patterns: number;
  solved_count: number;
  overall_accuracy: number;
  total_attempts: number;
  failed_attempts: number;
  solved_by_difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  weak_categories: {
    category: string;
    accuracy: number;
    unsolved_critical: number;
  }[];
  strong_categories: string[];
  algorithmic_readiness_score: number;
}

export interface SkillGapAnalysisResult {
  student_id: string;
  student_name: string;
  target_role: TargetCareerRole;
  role_readiness_score: number;
  verified_strengths_count: number;
  demonstrated_gaps_count: number;
  unassessed_skills_count: number;
  skills: EvaluatedSkill[];
  dsa_metrics: DsaPatternMetrics;
  prioritized_roadmap: {
    priority: SkillPriority;
    skill_or_topic: string;
    reason: string;
    suggested_activity: string;
    measurable_completion_criterion: string;
    resource_link?: string;
  }[];
  transparency_note: string;
}
