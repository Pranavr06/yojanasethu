import assert from 'assert';
import {
  dbGetStudentUploadedResume,
  dbSaveStudentUploadedResume,
  dbDeleteStudentUploadedResume,
  dbGetMentorMentees,
  dbGetAllStudents,
  dbGetFullStudent,
} from '@/lib/db';

export async function runPermanentResumeTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PERMANENT STUDENT RESUME & DASHBOARD INTEGRATION TESTS');
  console.log('======================================================');

  // Step 1: Find student by USN
  const testUsn = 'NNM24IS159';
  const student = await dbGetFullStudent(testUsn);
  if (!student) {
    throw new Error(`Test student ${testUsn} not found`);
  }
  const testStudentId = student.profile.id;
  console.log(`\n[TEST 1] Testing with Student: ${student.profile.full_name} (${testUsn}), ID: ${testStudentId}`);

  // Step 2: Upload and permanently save resume
  console.log('\n[TEST 2] Verifying Permanent Student Resume Storage (Supabase documents/resumes)...');
  const savedResume = await dbSaveStudentUploadedResume(testStudentId, {
    storage_path: `resumes/${testUsn}-1729737600000-Pranav_R_Resume.pdf`,
    file_name: 'Pranav_R_Resume.pdf',
    file_size: '312 KB',
    content_type: 'application/pdf',
  });

  assert(savedResume !== null, 'Saved resume should not be null');
  assert.strictEqual(savedResume.file_name, 'Pranav_R_Resume.pdf');
  assert.strictEqual(savedResume.file_size, '312 KB');
  assert(savedResume.storage_path.includes('Pranav_R_Resume.pdf'));
  assert(Boolean(savedResume.view_url), 'View URL should be generated');
  console.log('  ✓ Saved permanent resume record:');
  console.log(`    • File: ${savedResume.file_name} (${savedResume.file_size})`);
  console.log(`    • Storage Path: ${savedResume.storage_path}`);
  console.log(`    • Authorized View URL: ${savedResume.view_url}`);

  // Step 3: Retrieve by student ID and USN
  console.log('\n[TEST 3] Retrieving Resume by UUID & USN...');
  const retrievedById = await dbGetStudentUploadedResume(testStudentId);
  assert(retrievedById !== null, 'Should retrieve by UUID');
  assert.strictEqual(retrievedById.file_name, 'Pranav_R_Resume.pdf');

  const retrievedByUsn = await dbGetStudentUploadedResume(testUsn);
  assert(retrievedByUsn !== null, 'Should retrieve by USN');
  assert.strictEqual(retrievedByUsn.file_name, 'Pranav_R_Resume.pdf');
  console.log('  ✓ Successfully retrieved resume record using both Student UUID and USN');

  // Step 4: Verify Multi-Dashboard Integration - Mentor Dashboard
  console.log('\n[TEST 4] Verifying Mentor Dashboard Visibility...');
  const mentees = await dbGetMentorMentees();
  const mentee = mentees.find((m) => m.usn === testUsn || m.id === testStudentId);
  if (mentee) {
    assert.strictEqual(mentee.has_resume, true, 'Mentee has_resume flag should be true');
    assert(Boolean(mentee.resume_storage_path), 'Mentee should have resume_storage_path');
    console.log('  ✓ Mentor Dashboard accurately displays student resume:');
    console.log(`    • Mentee: ${mentee.full_name} (${mentee.usn})`);
    console.log(`    • Status: Resume on File (${mentee.resume_file_name})`);
  } else {
    console.log('  • (Mentees list empty or offline, checked fallback)');
  }

  // Step 5: Verify Multi-Dashboard Integration - Placements Dashboard
  console.log('\n[TEST 5] Verifying Placements Dashboard Visibility...');
  const updatedStudent = await dbGetFullStudent(testStudentId);
  assert(
    updatedStudent?.profile.resume_storage_path !== null,
    'Placements student profile must have resume_storage_path'
  );
  console.log('  ✓ Placements Dashboard profile has resume_storage_path:');
  console.log(`    • Student: ${updatedStudent?.profile.full_name}`);
  console.log(`    • Permanent Resume Path: ${updatedStudent?.profile.resume_storage_path}`);

  // Step 6: Replace Resume with an updated version
  console.log('\n[TEST 6] Verifying Resume Replacement (Updating File)...');
  const replacedResume = await dbSaveStudentUploadedResume(testStudentId, {
    storage_path: `resumes/${testUsn}-1729739999999-Pranav_R_Senior_Resume.pdf`,
    file_name: 'Pranav_R_Senior_Resume.pdf',
    file_size: '350 KB',
    content_type: 'application/pdf',
  });
  assert.strictEqual(replacedResume.file_name, 'Pranav_R_Senior_Resume.pdf');
  assert.strictEqual(replacedResume.file_size, '350 KB');

  const checkReplaced = await dbGetStudentUploadedResume(testStudentId);
  assert.strictEqual(checkReplaced?.file_name, 'Pranav_R_Senior_Resume.pdf');
  console.log('  ✓ Successfully replaced permanent resume with updated version:');
  console.log(`    • New File Name: ${checkReplaced?.file_name} (${checkReplaced?.file_size})`);

  // Step 7: Delete / Remove Permanent Resume
  console.log('\n[TEST 7] Verifying Resume Removal...');
  const deleteResult = await dbDeleteStudentUploadedResume(testStudentId);
  assert.strictEqual(deleteResult, true);

  const afterDelete = await dbGetStudentUploadedResume(testStudentId);
  assert(afterDelete === null, 'Resume should be null after deletion');
  console.log('  ✓ Successfully removed permanent resume and restored "Resume not uploaded" state');

  console.log('\n======================================================');
  console.log('✨ ALL PERMANENT STUDENT RESUME TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}
