import assert from 'assert';
import fs from 'fs';
import { dbGetPlacedStudents, dbGetStudentPlacementOffer, dbGetPlacementDrives } from '@/lib/db';
import { analyzeDriveWithGemini } from '@/lib/geminiDriveAnalyzer';

export async function runPlacedAndAiTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PLACED STUDENTS & GEMINI AI SKILL GAP TESTS');
  console.log('======================================================\n');

  // 1. Verify Voice Commands removal
  console.log('[TEST 1] Verifying Voice Commands removal in MockInterviewAssistant...');
  const mockContent = fs.readFileSync('src/components/student/MockInterviewAssistant.tsx', 'utf8');
  assert.strictEqual(
    mockContent.includes('Voice Commands:'),
    false,
    'Voice Commands text should be removed'
  );
  assert.strictEqual(
    mockContent.includes('auto-saves & advances to next question'),
    false,
    'Voice command description should be removed'
  );
  console.log('  ✓ Voice Commands guidance pill successfully removed.');

  // 2. Verify Placed Students Retrieval
  console.log('\n[TEST 2] Verifying Placed Students Retrieval (dbGetPlacedStudents)...');
  const placed = await dbGetPlacedStudents();
  assert.ok(Array.isArray(placed), 'Should return an array of placed students');
  assert.ok(placed.length >= 4, 'Should have verified campus placed students');
  console.log(`  ✓ Successfully retrieved ${placed.length} campus placed students.`);
  console.log(`    • Top Offer: ${placed[0].student_name} (${placed[0].student_usn}) at ${placed[0].company_name} — ${placed[0].ctc_lpa} LPA`);

  // 3. Verify Student Personal Placement Offer
  console.log('\n[TEST 3] Verifying dbGetStudentPlacementOffer for placed student Preethika...');
  const offer = await dbGetStudentPlacementOffer('NNM24IS174');
  assert.ok(offer !== null, 'Preethika should have a verified placement offer');
  assert.strictEqual(offer.company_name, 'Cisco Systems');
  assert.strictEqual(offer.ctc_lpa, 18.0);
  console.log(`  ✓ Personal placement offer retrieved: ${offer.student_name} placed at ${offer.company_name} (${offer.ctc_lpa} LPA)`);

  // 4. Verify Gemini AI Recruiter Drive Skill Gap Analysis
  console.log('\n[TEST 4] Verifying Gemini AI Recruiter Drive Skill Gap Analysis...');
  const drives = await dbGetPlacementDrives();
  assert.ok(drives.length > 0, 'Drives should exist');

  const targetDrive = drives[0];
  console.log(`  • Analyzing Recruiter Drive: ${targetDrive.company_name} (${targetDrive.role_title}, ${targetDrive.ctc_lpa} LPA)...`);

  const analysis = await analyzeDriveWithGemini(targetDrive.id);
  assert.ok(analysis !== null, 'Analysis should not be null');
  assert.strictEqual(analysis.drive_id, targetDrive.id);
  assert.ok(analysis.eligible_candidates_count >= 0, 'Eligible candidates count must be defined');
  assert.ok(Array.isArray(analysis.top_lacking_skills), 'Top lacking skills must be an array');
  assert.ok(Array.isArray(analysis.eligible_candidates), 'Eligible candidates list must be an array');
  assert.ok(analysis.top_lacking_skills.length > 0, 'Should identify top lacking skill sets');

  console.log(`  ✓ Gemini AI Analysis completed:`);
  console.log(`    • AI Provider: ${analysis.ai_provider}`);
  console.log(`    • Eligible Candidates Count: ${analysis.eligible_candidates_count}`);
  console.log(`    • Top Lacking Skill Sets for this Recruiter:`);
  analysis.top_lacking_skills.slice(0, 3).forEach((s) => {
    console.log(`      - ${s.skill_name} (${s.importance}): Missing in ${s.missing_count} (${s.percentage}%) of eligible candidates`);
  });

  // 5. Verify Candidate-Level Lacking Skills Structure
  console.log('\n[TEST 5] Verifying Candidate-Level Lacking Skills Breakdown...');
  if (analysis.eligible_candidates.length > 0) {
    const sampleCand = analysis.eligible_candidates[0];
    console.log(`  • Candidate: ${sampleCand.student_name} (${sampleCand.student_usn}, CGPA: ${sampleCand.cgpa.toFixed(2)})`);
    console.log(`    - Possessed Skills: ${sampleCand.possessed_skills.join(', ') || 'None'}`);
    console.log(`    - Lacking Skills: ${sampleCand.lacking_skills.map((l) => `${l.skill_name} (${l.importance})`).join(', ') || 'None'}`);
    console.log(`    - AI Recommendation: "${sampleCand.gemini_recommendation}"`);

    assert.ok(Array.isArray(sampleCand.lacking_skills), 'Lacking skills must be an array');
    assert.ok(Array.isArray(sampleCand.possessed_skills), 'Possessed skills must be an array');
    assert.ok(typeof sampleCand.gemini_recommendation === 'string', 'Recommendation must be string');
  }

  console.log('\n======================================================');
  console.log('✨ ALL PLACED STUDENTS & GEMINI AI SKILL TESTS PASSED!');
  console.log('======================================================\n');
}
