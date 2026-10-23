import {
  checkAnnouncementEligibility,
} from '../src/lib/rulesEngine';
import {
  dbGetPlacementAnnouncements,
  dbGetPlacementCalendarEvents,
  dbGetHistoricalPlacementStats,
  dbGetInAppNotifications,
} from '../src/lib/db';
import { FullStudentProfile, PlacementAnnouncement } from '../src/types';

async function runPlacementTransparencyTests() {
  console.log('================================================================');
  console.log('PLACEMENT TRANSPARENCY HUB: AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // --- UNIT TESTS: ELIGIBILITY ENGINE ---
  console.log('--- 1. Testing checkAnnouncementEligibility Rules Engine ---');

  const mockEligibleStudent: FullStudentProfile = {
    profile: {
      id: 'student-01',
      institution_id: '11111111-0000-0000-0000-000000000001',
      full_name: 'Preethika',
      email: 'preethika@nmamit.in',
      role: 'student',
      usn: 'NNM24IS174',
      department_code: 'ISE',
      graduation_year: 2026,
    },
    academic_record: {
      id: 'ar-01',
      institution_id: '11111111-0000-0000-0000-000000000001',
      student_id: 'student-01',
      usn: 'NNM24IS174',
      batch: '2022-2026',
      cgpa: 8.75,
      total_earned_credits: 120,
      active_backlogs: 0,
      history_of_backlogs: 0,
      source_system: 'NMAMIT Autonomous Examination Cell (Contineo ERP)',
      is_verified_by_exam_cell: true,
    },
    semester_marks: [],
    skills: [],
    evidence_submissions: [],
    roadmaps: [],
    target_role: 'Full Stack Engineer',
  };

  const sampleAnnouncement: PlacementAnnouncement = {
    id: 'ann-test-01',
    institution_id: '11111111-0000-0000-0000-000000000001',
    company_name: 'Nexus AI Technologies',
    role_title: 'AI/ML Engineering Intern',
    job_description: 'Develop scalable ML feature pipelines and inference profiling.',
    job_type: 'Internship + Full-time',
    ctc_lpa: 14.5,
    eligible_branches: ['ISE', 'CSE', 'AIML'],
    eligible_batches: [2026],
    min_cgpa: 7.0,
    max_active_backlogs: 0,
    allow_history_of_backlogs: true,
    required_skills: [{ name: 'Python', importance: 'mandatory', weight: 3 }],
    registration_open_date: new Date(Date.now() - 7 * 86400000).toISOString(),
    registration_deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'published',
    author_name: 'Training & Placement Cell, NMAMIT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Test 1.1: Eligible student meets all criteria
  const res1 = checkAnnouncementEligibility(mockEligibleStudent, sampleAnnouncement);
  assert(res1.decision === 'eligible', 'Eligible student gets decision "eligible"');
  assert(res1.isEligible === true, 'isEligible flag is true for qualified student');
  assert(res1.canApplyNow === true, 'canApplyNow flag is true when registration is open');

  // Test 1.2: Junior student (Batch 2028) observing Batch 2026 drive gets Early Prep Advisory
  const juniorStudent: FullStudentProfile = {
    ...mockEligibleStudent,
    profile: {
      ...mockEligibleStudent.profile,
      graduation_year: 2028,
    },
  };
  const res2 = checkAnnouncementEligibility(juniorStudent, sampleAnnouncement);
  assert(res2.decision === 'ineligible', 'Junior student gets decision "ineligible" for final-year drive');
  assert(res2.badgeLabel === 'Early Prep Advisory', 'Junior gets "Early Prep Advisory" badge label');
  assert(res2.badgeColor === 'blue', 'Early prep view uses distinctive blue advisory badge');
  assert(res2.reasons.some((r) => r.includes('your graduation year is 2028')), 'Contains specific batch explanation');

  // Test 1.3: CGPA cutoff failure
  const lowCgpaStudent: FullStudentProfile = {
    ...mockEligibleStudent,
    academic_record: {
      ...mockEligibleStudent.academic_record!,
      cgpa: 6.45,
    },
  };
  const res3 = checkAnnouncementEligibility(lowCgpaStudent, sampleAnnouncement);
  assert(res3.decision === 'ineligible', 'Low CGPA student gets decision "ineligible"');
  assert(res3.reasons.some((r) => r.includes('below minimum cutoff')), 'Reason explains CGPA cutoff deficit');

  // Test 1.4: Active backlog failure
  const backlogStudent: FullStudentProfile = {
    ...mockEligibleStudent,
    academic_record: {
      ...mockEligibleStudent.academic_record!,
      active_backlogs: 2,
    },
  };
  const res4 = checkAnnouncementEligibility(backlogStudent, sampleAnnouncement);
  assert(res4.decision === 'ineligible', 'Backlog student gets decision "ineligible"');
  assert(res4.reasons.some((r) => r.includes('active backlog(s)')), 'Reason explains backlogs limit exceeded');

  // Test 1.5: Branch not in eligible list
  const mechStudent: FullStudentProfile = {
    ...mockEligibleStudent,
    profile: {
      ...mockEligibleStudent.profile,
      department_code: 'MECH',
    },
  };
  const res5 = checkAnnouncementEligibility(mechStudent, sampleAnnouncement);
  assert(res5.decision === 'ineligible', 'MECH student gets decision "ineligible" on ISE/CSE drive');
  assert(res5.reasons.some((r) => r.includes('not in the eligible branches list')), 'Reason states branch restriction');

  // Test 1.6: Registration closed (past deadline)
  const expiredAnnouncement: PlacementAnnouncement = {
    ...sampleAnnouncement,
    registration_deadline: new Date(Date.now() - 2 * 86400000).toISOString(),
  };
  const res6 = checkAnnouncementEligibility(mockEligibleStudent, expiredAnnouncement);
  assert(res6.decision === 'registration_closed', 'Past deadline returns "registration_closed"');
  assert(res6.canApplyNow === false, 'Cannot apply when registration closed');

  // Test 1.7: Missing academic record in ERP
  const noRecordStudent: FullStudentProfile = {
    ...mockEligibleStudent,
    academic_record: null,
  };
  const res7 = checkAnnouncementEligibility(noRecordStudent, sampleAnnouncement);
  assert(res7.decision === 'unknown', 'Missing academic record returns decision "unknown"');
  assert(res7.missingDataWarnings.length > 0, 'Includes explicit missing ERP data warning');

  // --- DATABASE & DATA LAYER TESTS ---
  console.log('\n--- 2. Testing Database Access & Synthesis Layer ---');

  const announcements = await dbGetPlacementAnnouncements();
  assert(announcements.length > 0, `dbGetPlacementAnnouncements returned ${announcements.length} announcements`);
  assert(
    announcements.some((a) => a.eligible_batches.includes(2026)),
    'Contains opportunities for graduating batch 2026'
  );
  assert(
    announcements.some((a) => a.eligible_batches.includes(2027) || a.eligible_batches.includes(2028)),
    'Contains early opportunities for junior batches (2027/2028)'
  );

  const events = await dbGetPlacementCalendarEvents();
  assert(events.length > 0, `dbGetPlacementCalendarEvents returned ${events.length} timeline events`);
  const isChronological = events.every((e, idx) => {
    if (idx === 0) return true;
    return new Date(e.date).getTime() >= new Date(events[idx - 1].date).getTime();
  });
  assert(isChronological, 'Calendar events are sorted chronologically ascending');

  const history = await dbGetHistoricalPlacementStats();
  assert(history.total_students_placed > 0, `Historical stats: ${history.total_students_placed} placed students`);
  assert(history.top_recruiters.length > 0, `Historical top recruiters: ${history.top_recruiters.length} companies`);
  assert(history.department_summary.length > 0, `Department breakdown: ${history.department_summary.length} departments`);

  const notifications = await dbGetInAppNotifications();
  assert(notifications.length > 0, `In-app notifications returned ${notifications.length} alerts`);

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPlacementTransparencyTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
