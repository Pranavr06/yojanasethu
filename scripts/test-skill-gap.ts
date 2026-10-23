import assert from 'assert';
import {
  ROLE_BENCHMARKS,
  computeDsaPatternMetrics,
  analyzeStudentSkillGap,
} from '../src/lib/skillGapEngine';
import {
  dbGetStudentDsaProgress,
  dbUpsertStudentDsaProgress,
  dbUpdateStudentCareerGoal,
  dbGetFullStudent,
  dbResolveStudentProfileId,
} from '../src/lib/db';
import { validateStudentSession } from '../src/lib/serverAuth';
import { FullStudentProfile, StudentDsaProgress, TargetCareerRole } from '../src/types';

export async function runSkillGapTests() {
  console.log('\n========================================');
  console.log('--- RUNNING SKILL GAP & DSA TRACKER TESTS ---');
  console.log('========================================\n');

  // Test 1: Verify Role Benchmark Integrity
  console.log('[Test 1] Role Benchmark Integrity...');
  const expectedRoles: TargetCareerRole[] = ['Software Developer', 'AI/ML Engineer', 'Cybersecurity Analyst'];
  for (const role of expectedRoles) {
    const benchmarks = ROLE_BENCHMARKS[role];
    assert(Array.isArray(benchmarks), `Benchmark list must be an array for ${role}`);
    assert(benchmarks.length >= 4, `${role} must have at least 4 required benchmark skills`);
    for (const b of benchmarks) {
      assert(b.skill_name, 'Skill name must be non-empty');
      assert(b.weight >= 1 && b.weight <= 3, 'Weight must be between 1 and 3');
      assert(b.recommended_learning.measurable_completion_criterion, 'Must have measurable completion criteria');
    }
  }
  console.log('  ✓ All 3 role benchmarks validated with explicit skill requirements, weights, and measurable criteria.');

  // Test 2: Missing Data Is Never Treated As a Gap
  console.log('\n[Test 2] Missing Data Policy (Never treat unassessed skills as gaps)...');
  const dummyStudent: FullStudentProfile = {
    profile: {
      id: 'test-student-empty',
      institution_id: '11111111-0000-0000-0000-000000000001',
      email: 'blank@nmamit.in',
      full_name: 'Blank Candidate',
      role: 'student',
      usn: '4NM22CS999',
      department_code: 'CSE',
      semester: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    academic_record: {
      id: 'ar-empty',
      institution_id: '11111111-0000-0000-0000-000000000001',
      student_id: 'test-student-empty',
      usn: '4NM22CS999',
      batch: '2022-2026',
      cgpa: 8.5,
      total_earned_credits: 120,
      active_backlogs: 0,
      history_of_backlogs: 0,
      source_system: 'NMAMIT Autonomous Examination Cell (Contineo ERP)',
      is_verified_by_exam_cell: true,
    },
    semester_marks: [],
    skills: [], // Zero verified skills
    evidence_submissions: [],
    roadmaps: [],
    target_role: 'Software Developer',
  };

  const emptyAnalysis = analyzeStudentSkillGap({
    student: dummyStudent,
    dsaRecords: [],
    targetRole: 'Software Developer',
  });

  // Zero skills should mean 0 verified strengths and 0 demonstrated gaps; all required skills should be unassessed
  assert.strictEqual(emptyAnalysis.verified_strengths_count, 0, 'Zero verified skills must yield 0 strengths');
  assert.strictEqual(emptyAnalysis.demonstrated_gaps_count, 0, 'Missing skills must NOT be flagged as demonstrated gaps');
  assert(emptyAnalysis.unassessed_skills_count > 0, 'Unassessed skills count must be positive');

  const unassessedList = emptyAnalysis.skills.filter((s) => s.status === 'unassessed_missing');
  assert.strictEqual(unassessedList.length, emptyAnalysis.unassessed_skills_count);
  unassessedList.forEach((s) => {
    assert.strictEqual(s.status, 'unassessed_missing');
    assert(s.reason.includes('No active record') || s.reason.includes('No active algorithmic practice'), 'Reason must clarify lack of record');
  });
  console.log('  ✓ Verified: Missing skills are classified strictly as unassessed_missing, NOT demonstrated gaps.');

  // Test 3: Verified Strengths vs Demonstrated Gaps
  console.log('\n[Test 3] Demonstrated Gaps vs Verified Strengths...');
  const assessedStudent: FullStudentProfile = {
    ...dummyStudent,
    skills: [
      {
        id: 'sk-1',
        student_id: dummyStudent.profile.id,
        skill_name: 'Data Structures & Algorithms',
        category: 'Algorithms',
        tier: 'faculty_verified',
        verification_badge: true, // Faculty verified -> Strength
        confidence_score: 90,
        evidence_source: 'Faculty Review',
        evidence_date: new Date().toISOString(),
      },
      {
        id: 'sk-2',
        student_id: dummyStudent.profile.id,
        skill_name: 'Object-Oriented Programming (OOP)',
        category: 'Programming',
        tier: 'self_declared',
        verification_badge: false, // Self declared without faculty verification -> Demonstrated Gap!
        confidence_score: 40,
        evidence_source: 'Self Claim',
        evidence_date: new Date().toISOString(),
      },
    ],
  };

  const assessedAnalysis = analyzeStudentSkillGap({
    student: assessedStudent,
    dsaRecords: [],
    targetRole: 'Software Developer',
  });

  const verifiedStrengths = assessedAnalysis.skills.filter((s) => s.status === 'verified_strength');
  const demonstratedGaps = assessedAnalysis.skills.filter((s) => s.status === 'demonstrated_gap');

  assert(verifiedStrengths.some((s) => s.skill_name.includes('Data Structures')), 'Data Structures with badge must be in verifiedStrengths');
  assert(demonstratedGaps.some((s) => s.skill_name.includes('Object-Oriented Programming')), 'Unverified self-claim must be in demonstratedGaps');
  console.log('  ✓ Verified strengths and demonstrated gaps distinguished accurately based on verification badge.');

  // Test 4: DSA Pattern Metrics & High-Failure Category Detection
  console.log('\n[Test 4] DSA Pattern Metrics & Algorithmic Failure Detection...');
  const mockDsaRecords: StudentDsaProgress[] = [
    {
      student_id: 'dsa-tester',
      topic_id: 'dsa-1', // Arrays & Hashing
      status: 'solved',
      attempts_count: 2,
      failed_attempts: 0,
      accuracy_percentage: 100,
      time_spent_minutes: 20,
      last_practiced_at: new Date().toISOString(),
      notes: null,
      updated_at: new Date().toISOString(),
    },
    {
      student_id: 'dsa-tester',
      topic_id: 'dsa-16', // Dynamic Programming
      status: 'attempted',
      attempts_count: 5,
      failed_attempts: 4,
      accuracy_percentage: 20, // Low accuracy!
      time_spent_minutes: 60,
      last_practiced_at: new Date().toISOString(),
      notes: 'Struggling with recurrence state',
      updated_at: new Date().toISOString(),
    },
    {
      student_id: 'dsa-tester',
      topic_id: 'dsa-17', // Dynamic Programming
      status: 'attempted',
      attempts_count: 4,
      failed_attempts: 3,
      accuracy_percentage: 25,
      time_spent_minutes: 45,
      last_practiced_at: new Date().toISOString(),
      notes: null,
      updated_at: new Date().toISOString(),
    },
  ];

  const metrics = computeDsaPatternMetrics(mockDsaRecords);
  assert.strictEqual(metrics.solved_count, 1, 'Total solved should be 1');
  const weakCatNames = metrics.weak_categories.map((w) => w.category);
  assert(weakCatNames.includes('Dynamic Programming'), 'Dynamic Programming must be flagged as weak');
  assert(metrics.overall_accuracy < 60, 'Overall accuracy should reflect failures');
  console.log(`  ✓ DSA Metrics: ${metrics.solved_count} solved, weak categories: [${weakCatNames.join(', ')}], overall accuracy: ${metrics.overall_accuracy}%.`);

  // Test 5: Recommendations Generation
  console.log('\n[Test 5] Prioritized Recommendations Engine...');
  const analysisWithDsa = analyzeStudentSkillGap({
    student: dummyStudent,
    dsaRecords: mockDsaRecords,
    targetRole: 'Software Developer',
  });

  assert(analysisWithDsa.prioritized_roadmap.length > 0, 'Roadmap recommendations must be generated');
  const dsaRec = analysisWithDsa.prioritized_roadmap.find((r) => r.skill_or_topic.includes('Data Structures') || r.skill_or_topic.includes('Algorithms'));
  assert(dsaRec, 'Recommendation for DSA must be included due to incomplete coverage');
  assert(dsaRec.measurable_completion_criterion.length > 0, 'Measurable criteria must be defined');
  console.log(`  ✓ Generated ${analysisWithDsa.prioritized_roadmap.length} prioritized recommendations with measurable criteria.`);

  // Test 6: Cross-Student Data Isolation & Dual Identity Resolution
  console.log('\n[Test 6] Cross-Student Data Isolation & Dual Identity Resolution...');
  const pranavUuid = 'a0000003-0000-0000-0000-000000000001';
  const resolvedPranav = await dbResolveStudentProfileId('pranav.r@nmamit.in');
  assert.strictEqual(resolvedPranav, pranavUuid, 'pranav.r@nmamit.in must resolve to seeded UUID');

  // Verify auth session spoofing protection
  const fakeSession = { id: 'spoofed-attacker-uuid', email: 'attacker@evil.com' };
  const dummyReq = new Request('http://localhost:3000/api/student/dsa');
  const authCheck = await validateStudentSession(dummyReq, pranavUuid, fakeSession);
  assert.strictEqual(authCheck.authorized, false, 'Attacker cannot access Pranav records by supplying Pranav student_id');
  console.log('  ✓ Anti-spoofing verified: client supplying another student UUID is rejected with 403.');

  // Test 7: Data Layer Upsert & Persistence
  console.log('\n[Test 7] Student DSA Persistence & Target Role Updating...');
  const upserted = await dbUpsertStudentDsaProgress({
    student_id: pranavUuid,
    topic_id: 'dsa-20',
    status: 'solved',
    attempts_count: 1,
    failed_attempts: 0,
    time_spent_minutes: 30,
  });
  assert(upserted, 'DSA Progress should upsert successfully');
  assert.strictEqual(upserted.status, 'solved');

  const pranavDsa = await dbGetStudentDsaProgress(pranavUuid);
  assert(pranavDsa.some((r) => r.topic_id === 'dsa-20'), 'Pranav records must contain dsa-20');

  const updatedRole = await dbUpdateStudentCareerGoal({
    student_id: pranavUuid,
    target_role: 'AI/ML Engineer',
    learning_goals: ['Transformer Architectures', 'RAG Vector Indexing'],
  });
  assert.strictEqual(updatedRole, true, 'Career goal update should succeed');

  const fullPranav = await dbGetFullStudent(pranavUuid);
  assert(fullPranav, 'Full student record must exist');
  assert.strictEqual(fullPranav.profile.target_career_role, 'AI/ML Engineer', 'Target career role must be updated on profile');
  assert.strictEqual(fullPranav.target_role, 'AI/ML Engineer', 'Target role must be updated on full student view');
  console.log('  ✓ Data layer: DSA progress and target career goals successfully persisted and retrieved.');

  console.log('\n========================================');
  console.log('✔ ALL SKILL GAP & DSA TRACKER TESTS PASSED');
  console.log('========================================\n');
}

if (require.main === module) {
  runSkillGapTests().catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
}
