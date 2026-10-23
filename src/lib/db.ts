import {
  Profile,
  AcademicRecord,
  SemesterMark,
  StudentSkillPassport,
  EvidenceSubmission,
  PlacementDrive,
  Roadmap,
  FullStudentProfile,
  CohortSkillMetric,
  EvidenceType,
  PlacementStats,
  ApplicationStage,
  Department,
} from '@/types';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT INITIALIZATION
// All queries execute directly against live Supabase PostgreSQL tables.
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

export const INSTITUTION_ID = '11111111-0000-0000-0000-000000000001';

// ============================================================================
// DATA ACCESS LAYER: PURE DATABASE QUERIES (NO HARDCODED DATA)
// If database returns empty or is not connected, returns null / []
// ============================================================================

/**
 * Fetch user profile by institutional email from 'profiles' table
 */
export async function dbGetProfileByEmail(email: string): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, departments(code, name)')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      department_code: (data as any).departments?.code || undefined,
    } as Profile;
  } catch (err) {
    console.error('dbGetProfileByEmail error:', err);
    return null;
  }
}

/**
 * Fetch user profile by ID from 'profiles' table
 */
export async function dbGetProfileById(id: string): Promise<Profile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, departments(code, name)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      department_code: (data as any).departments?.code || undefined,
    } as Profile;
  } catch (err) {
    console.error('dbGetProfileById error:', err);
    return null;
  }
}

/**
 * Fetch full student profile from database tables:
 * - profiles
 * - academic_records (Contineo ERP)
 * - semester_marks
 * - student_skill_passport
 * - evidence_submissions
 * - roadmaps
 */
export async function dbGetFullStudent(studentIdOrUsn: string): Promise<FullStudentProfile | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentIdOrUsn);
    let query = supabase.from('profiles').select('*, departments(code, name)');

    if (isUuid) {
      query = query.eq('id', studentIdOrUsn);
    } else if (studentIdOrUsn.includes('@')) {
      query = query.eq('email', studentIdOrUsn.trim().toLowerCase());
    } else {
      query = query.ilike('usn', studentIdOrUsn.trim());
    }

    const { data: profileData, error: profileErr } = await query.maybeSingle();
    if (profileErr || !profileData) {
      return null;
    }

    const profile: Profile = {
      ...profileData,
      department_code: (profileData as any).departments?.code || undefined,
    };

    // Parallel fetch related tables
    const [academicRes, skillsRes, submissionsRes, roadmapsRes] = await Promise.all([
      supabase.from('academic_records').select('*').eq('student_id', profile.id).maybeSingle(),
      supabase.from('student_skill_passport').select('*').eq('student_id', profile.id),
      supabase.from('evidence_submissions').select('*').eq('student_id', profile.id).order('submitted_at', { ascending: false }),
      supabase.from('roadmaps').select('*').eq('student_id', profile.id).order('week_number', { ascending: true }),
    ]);

    const academic_record: AcademicRecord | null = academicRes.data || null;

    let semester_marks: SemesterMark[] = [];
    if (academic_record?.id) {
      const marksRes = await supabase
        .from('semester_marks')
        .select('*')
        .eq('academic_record_id', academic_record.id)
        .order('semester', { ascending: true });
      if (marksRes.data) semester_marks = marksRes.data;
    }

    const skills: StudentSkillPassport[] = skillsRes.data || [];
    const evidence_submissions: EvidenceSubmission[] = submissionsRes.data || [];
    const roadmaps: Roadmap[] = roadmapsRes.data || [];
    const target_role = `${profile.department_code || 'Engineering'} Core Specialist`;

    return {
      profile,
      academic_record,
      semester_marks,
      skills,
      evidence_submissions,
      roadmaps,
      target_role,
    };
  } catch (err) {
    console.error('dbGetFullStudent error:', err);
    return null;
  }
}

/**
 * Fetch all students from database
 */
export async function dbGetAllStudents(): Promise<FullStudentProfile[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data: studentProfiles, error: pErr } = await supabase
      .from('profiles')
      .select('*, departments(code, name)')
      .eq('role', 'student');

    if (pErr) throw pErr;
    if (!studentProfiles || studentProfiles.length === 0) return [];

    const studentIds = studentProfiles.map((p) => p.id);

    // Parallel bulk query for academic_records and student_skill_passport
    const [academicRes, skillsRes] = await Promise.all([
      supabase.from('academic_records').select('*').in('student_id', studentIds),
      supabase.from('student_skill_passport').select('*').in('student_id', studentIds),
    ]);

    if (academicRes.error) throw academicRes.error;
    if (skillsRes.error) throw skillsRes.error;

    const academicMap = new Map<string, AcademicRecord>();
    (academicRes.data || []).forEach((ar) => academicMap.set(ar.student_id, ar));

    const skillsMap = new Map<string, StudentSkillPassport[]>();
    (skillsRes.data || []).forEach((sk) => {
      const existing = skillsMap.get(sk.student_id) || [];
      existing.push(sk);
      skillsMap.set(sk.student_id, existing);
    });

    return studentProfiles.map((sp) => {
      const profile: Profile = {
        ...sp,
        department_code: (sp as any).departments?.code || undefined,
      };
      return {
        profile,
        academic_record: academicMap.get(sp.id) || null,
        semester_marks: [],
        skills: skillsMap.get(sp.id) || [],
        evidence_submissions: [],
        roadmaps: [],
        target_role: `${profile.department_code || 'Engineering'} Core Specialist`,
      };
    });
  } catch (err) {
    console.error('dbGetAllStudents error:', err);
    throw err;
  }
}

/**
 * Student submits project or certificate evidence into 'evidence_submissions' table
 */
export async function dbSubmitEvidence(params: {
  student_id: string;
  institution_id?: string;
  title: string;
  skill_name: string;
  github_repo_url?: string;
  description: string;
  type?: EvidenceType;
  document_storage_path?: string;
  credential_url?: string;
}): Promise<EvidenceSubmission | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const {
    student_id,
    institution_id = INSTITUTION_ID,
    title,
    skill_name,
    github_repo_url,
    description,
    type = 'github_repo',
    document_storage_path,
    credential_url,
  } = params;

  try {
    const { data, error } = await supabase
      .from('evidence_submissions')
      .insert({
        institution_id,
        student_id,
        title,
        type,
        description,
        issue_date: new Date().toISOString().split('T')[0],
        issuer_or_organization: type === 'certificate' ? 'Authorized Certifying Authority' : 'GitHub Repository',
        technologies: [skill_name],
        associated_skills: [skill_name],
        github_repo_url: github_repo_url || null,
        document_storage_path: document_storage_path || null,
        credential_url: credential_url || null,
        team_size: 1,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('dbSubmitEvidence insert error:', error);
      return null;
    }

    return data as EvidenceSubmission;
  } catch (err) {
    console.error('dbSubmitEvidence error:', err);
    return null;
  }
}

/**
 * Fetch pending submissions awaiting faculty mentor review
 */
export async function dbGetPendingSubmissions(): Promise<EvidenceSubmission[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data: rawSubmissions, error } = await supabase
      .from('evidence_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error || !rawSubmissions || rawSubmissions.length === 0) return [];

    const studentIds = [...new Set(rawSubmissions.map((s) => s.student_id))];
    const { data: studentProfiles } = await supabase
      .from('profiles')
      .select('id, full_name, usn, department_id, departments(code)')
      .in('id', studentIds);

    const pMap = new Map((studentProfiles || []).map((p) => [p.id, p]));

    return rawSubmissions.map((sub) => {
      const student = pMap.get(sub.student_id);
      return {
        ...sub,
        student_name: student?.full_name || 'Student',
        student_usn: student?.usn || '',
        student_branch: (student as any)?.departments?.code || 'ISE',
      };
    });
  } catch (err) {
    console.error('dbGetPendingSubmissions error:', err);
    return [];
  }
}

/**
 * Faculty mentor verifies evidence:
 * Updates 'evidence_submissions' and unlocks verification_badge in 'student_skill_passport'
 */
export async function dbVerifySubmission(params: {
  submission_id: string;
  approved: boolean;
  faculty_comment?: string;
  reviewer_name?: string;
  reviewer_id?: string;
}): Promise<{ submission: EvidenceSubmission | null; passportSkill: StudentSkillPassport | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { submission: null, passportSkill: null };
  }

  const { submission_id, approved, faculty_comment, reviewer_name, reviewer_id } = params;
  const newStatus = approved ? 'verified' : 'rejected';
  const feedback = faculty_comment || (approved ? 'Codebase verified and endorsed.' : 'Revision required.');

  try {
    const { data: updatedSub, error: subErr } = await supabase
      .from('evidence_submissions')
      .update({
        status: newStatus,
        faculty_feedback: feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission_id)
      .select('*')
      .single();

    if (subErr || !updatedSub) {
      console.error('dbVerifySubmission update error:', subErr);
      return { submission: null, passportSkill: null };
    }

    let passportSkill: StudentSkillPassport | null = null;

    if (approved) {
      const skillName = (updatedSub.associated_skills && updatedSub.associated_skills[0]) || 'Technical Skill';
      const { data: existingSkill } = await supabase
        .from('student_skill_passport')
        .select('*')
        .eq('student_id', updatedSub.student_id)
        .ilike('skill_name', skillName)
        .maybeSingle();

      if (existingSkill) {
        const { data: updatedSkill } = await supabase
          .from('student_skill_passport')
          .update({
            tier: 'evidenced',
            verification_badge: true,
            evidence_source: `Faculty Review (${reviewer_name || 'Dr. K. Sharma'})`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSkill.id)
          .select('*')
          .single();
        passportSkill = updatedSkill;
      } else {
        const { data: newSkill } = await supabase
          .from('student_skill_passport')
          .insert({
            student_id: updatedSub.student_id,
            skill_name: skillName,
            category: 'programming',
            tier: 'evidenced',
            confidence_score: 90,
            evidence_source: `Faculty Review (${reviewer_name || 'Dr. K. Sharma'})`,
            evidence_date: new Date().toISOString().split('T')[0],
            verification_badge: true,
          })
          .select('*')
          .single();
        passportSkill = newSkill;
      }

      if (reviewer_id) {
        try {
          await supabase.from('verification_reviews').insert({
            submission_id: updatedSub.id,
            reviewer_id: reviewer_id,
            status: 'verified',
            faculty_comment: feedback,
          });
        } catch (e) {
          // ignore review audit failure
        }
      }
    }

    return { submission: updatedSub, passportSkill };
  } catch (err) {
    console.error('dbVerifySubmission error:', err);
    return { submission: null, passportSkill: null };
  }
}

/**
 * Fetch placement drives from 'placement_drives' joined with 'companies'
 */
export async function dbGetPlacementDrives(): Promise<PlacementDrive[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('placement_drives')
      .select('*, companies(name, logo_url, website)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      ...d,
      company_name: d.companies?.name || 'Recruitment Drive',
    }));
  } catch (err) {
    console.error('dbGetPlacementDrives error:', err);
    return [];
  }
}

/**
 * Placement Department (TPO): Drives with dynamic eligible student counts
 */
export async function dbGetPlacementDrivesWithEligibility(): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const drives = await dbGetPlacementDrives();
    if (drives.length === 0) return [];

    const [{ data: students }, { data: records }, { data: applications }] = await Promise.all([
      supabase.from('profiles').select('id, department_id, departments(code)').eq('role', 'student'),
      supabase.from('academic_records').select('student_id, cgpa, active_backlogs'),
      supabase.from('drive_applications').select('id, drive_id, student_id, stage'),
    ]);

    const studentList = students || [];
    const arMap = new Map((records || []).map((r) => [r.student_id, r]));
    const appsList = applications || [];

    return drives.map((drive) => {
      const eligibleCount = studentList.filter((s) => {
        const ar = arMap.get(s.id);
        if (!ar) return false;
        if (ar.cgpa < drive.min_cgpa) return false;
        if (ar.active_backlogs > drive.max_active_backlogs) return false;
        const branchCode = (s as any).departments?.code;
        if (branchCode && drive.eligible_branches && !drive.eligible_branches.includes(branchCode)) return false;
        return true;
      }).length;

      const applicants = appsList.filter((da) => da.drive_id === drive.id);

      return {
        ...drive,
        eligible_students_count: eligibleCount,
        applications_count: applicants.length,
        offers_released_count: applicants.filter((a) => a.stage === 'selected').length,
      };
    });
  } catch (err) {
    console.error('dbGetPlacementDrivesWithEligibility error:', err);
    return [];
  }
}

/**
 * Create a new placement drive in 'placement_drives'
 */
export async function dbCreatePlacementDrive(driveData: Partial<PlacementDrive>): Promise<PlacementDrive | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('placement_drives')
      .insert({
        institution_id: INSTITUTION_ID,
        company_id: driveData.company_id || '90000001-0000-0000-0000-000000000001',
        role_title: driveData.role_title || 'Associate Software Engineer',
        ctc_lpa: Number(driveData.ctc_lpa) || 10.0,
        stipend_per_month: driveData.stipend_per_month ? Number(driveData.stipend_per_month) : null,
        job_location: driveData.job_location || 'Bengaluru',
        job_description: driveData.job_description || 'Campus recruitment drive.',
        eligible_branches: driveData.eligible_branches || ['ISE', 'CSE', 'AIML'],
        min_cgpa: Number(driveData.min_cgpa) || 7.0,
        max_active_backlogs: driveData.max_active_backlogs !== undefined ? Number(driveData.max_active_backlogs) : 0,
        batch_year: driveData.batch_year || 2026,
        recruitment_status: driveData.recruitment_status || 'published',
        registration_deadline: driveData.registration_deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      })
      .select('*, companies(name)')
      .single();

    if (error || !data) {
      console.error('dbCreatePlacementDrive error:', error);
      return null;
    }

    return {
      ...data,
      company_name: (data as any).companies?.name || 'Partner Company',
    };
  } catch (err) {
    console.error('dbCreatePlacementDrive error:', err);
    return null;
  }
}

/**
 * Fetch applicants for a campus recruitment drive
 */
export async function dbGetDriveApplications(driveId?: string): Promise<any[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let rawQuery = supabase.from('drive_applications').select('*');
    if (driveId && driveId !== 'all') {
      rawQuery = rawQuery.eq('drive_id', driveId);
    }
    const { data: rawApps, error } = await rawQuery;
    if (error || !rawApps || rawApps.length === 0) return [];

    const studentIds = [...new Set(rawApps.map((a) => a.student_id))];
    const driveIds = [...new Set(rawApps.map((a) => a.drive_id))];

    const [{ data: profs }, { data: recs }, { data: drvs }, { data: passports }] = await Promise.all([
      supabase.from('profiles').select('id, full_name, usn, department_id, departments(code)').in('id', studentIds),
      supabase.from('academic_records').select('student_id, cgpa, active_backlogs, is_verified_by_exam_cell').in('student_id', studentIds),
      supabase.from('placement_drives').select('id, role_title, company_id, companies(name)').in('id', driveIds),
      supabase.from('student_skill_passport').select('student_id, verification_badge').in('student_id', studentIds),
    ]);

    const profMap = new Map((profs || []).map((p) => [p.id, p]));
    const arMap = new Map((recs || []).map((r) => [r.student_id, r]));
    const drvMap = new Map((drvs || []).map((d) => [d.id, d]));

    return rawApps.map((app) => {
      const student = profMap.get(app.student_id);
      const ar = arMap.get(app.student_id);
      const drive = drvMap.get(app.drive_id);
      const studentSkills = (passports || []).filter((s) => s.student_id === app.student_id);

      return {
        ...app,
        student_name: student?.full_name || 'Student',
        student_usn: student?.usn || '',
        student_department: (student as any)?.departments?.code || 'ISE',
        cgpa: ar?.cgpa || 0,
        active_backlogs: ar?.active_backlogs || 0,
        is_contineo_verified: ar?.is_verified_by_exam_cell ?? false,
        verified_skills_count: studentSkills.filter((s) => s.verification_badge).length,
        total_skills_count: studentSkills.length,
        company_name: (drive as any)?.companies?.name || 'Campus Drive',
        role_title: drive?.role_title || 'Software Trainee',
      };
    });
  } catch (err) {
    console.error('dbGetDriveApplications error:', err);
    return [];
  }
}

/**
 * Update candidate application stage (applied, shortlisted, interview_scheduled, selected, rejected)
 */
export async function dbUpdateApplicationStage(applicationId: string, stage: ApplicationStage): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('drive_applications')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error) {
      console.error('dbUpdateApplicationStage error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('dbUpdateApplicationStage error:', err);
    return null;
  }
}

/**
 * Campus Placement Overview Statistics (TPO Dashboard)
 */
export async function dbGetPlacementStats(): Promise<PlacementStats | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [{ data: departments }, { data: students }, { data: records }, { data: offers }, { data: drives }, { data: companies }] = await Promise.all([
      supabase.from('departments').select('id, code, name'),
      supabase.from('profiles').select('id, department_id').eq('role', 'student'),
      supabase.from('academic_records').select('student_id, cgpa, active_backlogs'),
      supabase.from('drive_applications').select('id, student_id, stage').eq('stage', 'selected'),
      supabase.from('placement_drives').select('id, ctc_lpa, recruitment_status'),
      supabase.from('companies').select('id'),
    ]);

    if (!departments || departments.length === 0) return null;

    const studentList = students || [];
    const arMap = new Map((records || []).map((r) => [r.student_id, r]));
    const selectedOffers = offers || [];
    const drivesList = drives || [];

    const deptStats = departments.map((dept) => {
      const deptStudents = studentList.filter((s) => s.department_id === dept.id);
      const totalDept = deptStudents.length;

      const eligibleDept = deptStudents.filter((s) => {
        const ar = arMap.get(s.id);
        return ar && ar.cgpa >= 7.0 && ar.active_backlogs === 0;
      }).length;

      const placedDept = deptStudents.filter((s) =>
        selectedOffers.some((o) => o.student_id === s.id)
      ).length;

      const deptCgpas = deptStudents
        .map((s) => arMap.get(s.id)?.cgpa || 0)
        .filter((c) => c > 0);

      const avgCgpa = deptCgpas.length > 0 ? deptCgpas.reduce((a, b) => a + b, 0) / deptCgpas.length : 0;

      return {
        department_code: dept.code,
        department_name: dept.name,
        total_students: totalDept,
        eligible_students: eligibleDept,
        placed_students: placedDept,
        average_cgpa: Number(avgCgpa.toFixed(2)),
        placement_rate: eligibleDept > 0 ? Number(((placedDept / eligibleDept) * 100).toFixed(1)) : 0,
      };
    });

    const totalEligible = deptStats.reduce((sum, d) => sum + d.eligible_students, 0);
    const totalPlaced = deptStats.reduce((sum, d) => sum + d.placed_students, 0);
    const overallRate = totalEligible > 0 ? Number(((totalPlaced / totalEligible) * 100).toFixed(1)) : 0;

    const ctcValues = drivesList.map((d) => Number(d.ctc_lpa)).filter((c) => !isNaN(c) && c > 0);
    const highestCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
    const avgCtc = ctcValues.length > 0 ? ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length : 0;

    return {
      total_companies: (companies || []).length,
      active_drives: drivesList.filter((d) => d.recruitment_status !== 'cancelled' && d.recruitment_status !== 'completed').length,
      total_offers: selectedOffers.length,
      highest_package_lpa: Number(highestCtc.toFixed(1)),
      average_package_lpa: Number(avgCtc.toFixed(1)),
      placement_percentage: overallRate,
      department_stats: deptStats,
    };
  } catch (err) {
    console.error('dbGetPlacementStats error:', err);
    return null;
  }
}

/**
 * Cohort Skill Gap Analytics based on student_skill_passport
 */
export async function dbGetCohortMetrics(): Promise<CohortSkillMetric[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const [{ data: students }, { data: passports }, { data: submissions }] = await Promise.all([
      supabase.from('profiles').select('id').eq('role', 'student'),
      supabase.from('student_skill_passport').select('*'),
      supabase.from('evidence_submissions').select('*').eq('status', 'pending'),
    ]);

    const totalStudents = students?.length || 0;
    if (totalStudents === 0) return [];

    const allSkills = passports || [];
    const allPending = submissions || [];

    const uniqueSkills = [...new Set(allSkills.map((s) => s.skill_name))];
    if (uniqueSkills.length === 0) return [];

    return uniqueSkills.map((name) => {
      const matching = allSkills.filter((s) => s.skill_name.toLowerCase() === name.toLowerCase());
      const verified = matching.filter((s) => s.verification_badge).length;
      const selfDeclared = matching.filter((s) => !s.verification_badge).length;
      const pending = allPending.filter((es) =>
        es.associated_skills?.some((sk: string) => sk.toLowerCase() === name.toLowerCase())
      ).length;

      const missing = Math.max(0, totalStudents - (verified + pending + selfDeclared));
      const gapPercentage = Math.round(((totalStudents - verified) / totalStudents) * 100);

      return {
        skill_name: name,
        category: matching[0]?.category || 'technical',
        verified_count: verified,
        pending_count: pending,
        self_declared_count: selfDeclared,
        missing_count: missing,
        total_students: totalStudents,
        gap_percentage: gapPercentage,
      };
    }).sort((a, b) => b.gap_percentage - a.gap_percentage);
  } catch (err) {
    console.error('dbGetCohortMetrics error:', err);
    return [];
  }
}

/**
 * Fetch 30-Day Personalized Learning Roadmap from 'roadmaps' table
 */
export async function dbGetRoadmap(studentId: string): Promise<Roadmap[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('student_id', studentId)
      .order('week_number', { ascending: true });

    if (error || !data) return [];
    return data as Roadmap[];
  } catch (err) {
    console.error('dbGetRoadmap error:', err);
    return [];
  }
}

/**
 * Toggle roadmap task completion
 */
export async function dbToggleRoadmap(taskId: string): Promise<Roadmap | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: current } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!current) return null;

    const { data, error } = await supabase
      .from('roadmaps')
      .update({ is_completed: !current.is_completed })
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) return null;
    return data as Roadmap;
  } catch (err) {
    console.error('dbToggleRoadmap error:', err);
    return null;
  }
}
