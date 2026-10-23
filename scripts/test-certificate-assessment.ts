import { classifyCertificateSubject } from '../src/lib/subjectClassifier';
import {
  getSubjectQuestionsForClient,
  gradeAssessmentSubmission,
  SUBJECT_METADATA,
} from '../src/lib/assessmentQuestions';
import { generateQRCodeMatrix } from '../src/lib/qrCode';
import {
  dbGetPublicVerificationData,
  dbResolveStudentProfileId,
  dbSubmitEvidence,
  dbSaveCertificateAssessment,
} from '../src/lib/db';
import { validateStudentSession } from '../src/lib/serverAuth';
import { AssessmentSubject } from '../src/types';

export async function runCertificateAssessmentTests() {
  console.log('\n================================================================');
  console.log('CERTIFICATE ASSESSMENT & VERIFICATION WORKFLOW: TEST SUITE');
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

  // --- SUITE 1: SUBJECT CLASSIFIER ---
  console.log('--- 1. Testing Certificate Subject Classifier ---');

  const awsResult = classifyCertificateSubject(
    'AWS Certified Solutions Architect Associate',
    'Amazon Web Services certification in EC2, S3, IAM and VPC cloud infrastructure'
  );
  assert(awsResult.subject === 'cloud_aws', 'Identifies AWS Cloud correctly', `Got ${awsResult.subject}`);
  assert(awsResult.confidence >= 0.7, 'High confidence for AWS certificate', `Got ${awsResult.confidence}`);

  const mlResult = classifyCertificateSubject(
    'Deep Learning Specialization with PyTorch and Neural Networks',
    'Coursera / DeepLearning.AI training in backpropagation and computer vision'
  );
  assert(mlResult.subject === 'machine_learning', 'Identifies Deep Learning correctly', `Got ${mlResult.subject}`);

  const pyResult = classifyCertificateSubject(
    'Python for Everybody - Programming Masterclass',
    'University of Michigan Python programming certification'
  );
  assert(pyResult.subject === 'python', 'Identifies Python correctly', `Got ${pyResult.subject}`);

  const sqlResult = classifyCertificateSubject(
    'Database Design and SQL Query Optimization',
    'Oracle Certified Associate in relational database management'
  );
  assert(sqlResult.subject === 'sql_databases', 'Identifies SQL / Database', `Got ${sqlResult.subject}`);

  const ambiguousResult = classifyCertificateSubject(
    'Leadership and Creative Problem Solving Summit 2025',
    'Participation certificate in annual student conference'
  );
  assert(ambiguousResult.needsConfirmation === true, 'Requires student confirmation for non-technical or ambiguous certificates');
  assert(ambiguousResult.suggestedAlternatives.length > 0, 'Offers suggested subject alternatives when ambiguous');

  // --- SUITE 2: CLIENT QUESTION SANITIZATION ---
  console.log('\n--- 2. Testing Assessment Question Sanitization for Student Security ---');

  const clientQuestions = getSubjectQuestionsForClient('cloud_aws');
  assert(clientQuestions.length >= 5, 'Returns active questions for cloud_aws subject', `Count: ${clientQuestions.length}`);

  let answerKeyLeaked = false;
  for (const q of clientQuestions) {
    if ('correctOptionIndex' in q || 'explanation' in q || 'gradingRationale' in q) {
      answerKeyLeaked = true;
      break;
    }
  }
  assert(!answerKeyLeaked, 'Student-facing questions strictly omit correctOptionIndex, explanation, and gradingRationale');

  // --- SUITE 3: DETERMINISTIC SERVER-SIDE GRADING ---
  console.log('\n--- 3. Testing Deterministic Server-Side Scoring & Grading Rubric ---');

  // Perfect submission for Python (py-01: 1, py-02: 2, py-03: 1, py-04: 2, py-05: 1)
  const perfectAnswers = [
    { questionId: 'py-01', selectedOptionIndex: 1 },
    { questionId: 'py-02', selectedOptionIndex: 2 },
    { questionId: 'py-03', selectedOptionIndex: 1 },
    { questionId: 'py-04', selectedOptionIndex: 2 },
    { questionId: 'py-05', selectedOptionIndex: 1 },
  ];

  const perfectGrading = gradeAssessmentSubmission('python', perfectAnswers);
  assert(perfectGrading.score_percentage === 100, 'Calculates 100% for all-correct answers', `Got: ${perfectGrading.score_percentage}%`);
  assert(perfectGrading.correct_answers === 5 && perfectGrading.total_questions === 5, 'Correctly tallies earned and total questions');

  // Partial submission (3 of 5 correct)
  const partialAnswers = [
    { questionId: 'py-01', selectedOptionIndex: 1 }, // Correct (1)
    { questionId: 'py-02', selectedOptionIndex: 0 }, // Wrong (should be 2)
    { questionId: 'py-03', selectedOptionIndex: 1 }, // Correct (1)
    { questionId: 'py-04', selectedOptionIndex: 2 }, // Correct (2)
    { questionId: 'py-05', selectedOptionIndex: 3 }, // Wrong (should be 1)
  ];

  const partialGrading = gradeAssessmentSubmission('python', partialAnswers);
  assert(partialGrading.correct_answers === 3, 'Correctly calculates 3 out of 5', `Got: ${partialGrading.correct_answers}`);
  assert(partialGrading.score_percentage === 60.0, 'Calculates (3/5)*100 = 60%', `Got: ${partialGrading.score_percentage}%`);
  assert(partialGrading.answers.length === 5, 'Provides complete graded breakdown with explanations');

  // Zero submission
  const zeroAnswers = [
    { questionId: 'py-01', selectedOptionIndex: 0 },
    { questionId: 'py-02', selectedOptionIndex: 0 },
    { questionId: 'py-03', selectedOptionIndex: 0 },
    { questionId: 'py-04', selectedOptionIndex: 0 },
    { questionId: 'py-05', selectedOptionIndex: 0 },
  ];
  const zeroGrading = gradeAssessmentSubmission('python', zeroAnswers);
  assert(zeroGrading.score_percentage === 0, 'Calculates 0% for all incorrect answers');
  assert(zeroGrading.correct_answers === 0, 'Marks 0 correct answers for failing attempt');

  // --- SUITE 4: RETAKE POLICY GATE & ATTEMPT LIMITS ---
  console.log('\n--- 4. Testing Retake Policy and Attempt Limit Gate ---');

  // Function to simulate retake eligibility
  function checkRetakeAllowed(currentAttempts: number, canRetakeFlag: boolean): boolean {
    if (currentAttempts === 0) return true; // Initial attempt always allowed
    if (currentAttempts === 1) return canRetakeFlag === true; // Exactly 1 mentor retake
    return false; // 2 or more attempts strictly prohibited
  }

  assert(checkRetakeAllowed(0, false) === true, 'Attempt 1 is permitted by default');
  assert(checkRetakeAllowed(1, false) === false, 'Attempt 2 is blocked if mentor has not granted retake');
  assert(checkRetakeAllowed(1, true) === true, 'Attempt 2 is allowed when mentor grants retake');
  assert(checkRetakeAllowed(2, true) === false, 'Attempt 3 is strictly blocked regardless of flags');
  assert(checkRetakeAllowed(3, true) === false, 'Attempt 4 is strictly blocked');

  // --- SUITE 5: SVG QR CODE GENERATION ---
  console.log('\n--- 5. Testing Pure SVG QR Code Generator ---');

  const sampleUrl = 'https://pathpilot.nmamit.in/verify/cred-aws-01';
  const qr = generateQRCodeMatrix(sampleUrl);

  assert(qr.size >= 21, 'Generates valid QR matrix size', `Size: ${qr.size}x${qr.size}`);
  assert(qr.modules.length === qr.size, 'Matrix row count matches size');
  assert(qr.modules[0].length === qr.size, 'Matrix column count matches size');
  assert(qr.modules[3][3] === true, 'Finder pattern center module is black');

  // --- SUITE 6: PUBLIC VERIFICATION RESOLVER & DATA MINIMIZATION ---
  console.log('\n--- 6. Testing Public Verification Resolver & Zero PII Leakage ---');

  const pubData = await dbGetPublicVerificationData('cred-aws-01');
  assert(pubData !== null && pubData.isValid === true, 'Resolves valid public verification record');
  assert(Boolean(pubData?.maskedUsn.includes('***')), 'Masks student USN for privacy protection', `USN: ${pubData?.maskedUsn}`);
  assert(!('email' in (pubData || {})), 'Does not expose student email in public verification');
  assert(!('phone' in (pubData || {})), 'Does not expose student phone in public verification');
  assert(!('file_path' in (pubData || {})), 'Does not expose raw document storage path');
  assert(Boolean(pubData?.institution.includes('NMAM')), 'Includes institutional accreditation badge');

  // --- SUITE 7: IDENTITY INTEGRITY, AUTHORIZATION & FAILURE MODES ---
  console.log('\n--- 7. Testing Identity Integrity, Strict Authorization & Safe Failure Modes ---');

  // A. Legitimate student resolution
  const resolvedPranavUsn = await dbResolveStudentProfileId('NNM24IS159');
  assert(resolvedPranavUsn === 'a0000003-0000-0000-0000-000000000001', 'Resolves student USN NNM24IS159 to Pranav R UUID', `Got: ${resolvedPranavUsn}`);

  const resolvedPranavEmail = await dbResolveStudentProfileId('pranav.r@nmamit.in');
  assert(resolvedPranavEmail === 'a0000003-0000-0000-0000-000000000001', 'Resolves student email to Pranav R UUID', `Got: ${resolvedPranavEmail}`);

  const resolvedPreethikaUsn = await dbResolveStudentProfileId('NNM24IS174');
  assert(resolvedPreethikaUsn === 'a0000001-0000-0000-0000-000000000001', 'Resolves student USN NNM24IS174 to Preethika UUID', `Got: ${resolvedPreethikaUsn}`);

  // B. Unknown USNs, unmapped emails, and invalid UUIDs must fail safely (NO DEFAULT STUDENT FALLBACK)
  const unknownUsn = await dbResolveStudentProfileId('UNKNOWN_USN_99999');
  assert(unknownUsn === null, 'Unknown USN strictly resolves to null without falling back to default student');

  const unmappedEmail = await dbResolveStudentProfileId('unmapped.random.user@external.com');
  assert(unmappedEmail === null, 'Unmapped email strictly resolves to null without falling back to default student');

  const invalidUuid = await dbResolveStudentProfileId('00000000-0000-0000-0000-000000000000');
  assert(invalidUuid === null, 'Invalid/non-existent UUID strictly resolves to null');

  const fakeUuid = await dbResolveStudentProfileId('11111111-1111-1111-1111-111111111111');
  assert(fakeUuid === null, 'Unseeded UUID strictly resolves to null without falling back');

  const emptyId = await dbResolveStudentProfileId('');
  assert(emptyId === null, 'Empty string resolves to null');

  const undefinedId = await dbResolveStudentProfileId(undefined);
  assert(undefinedId === null, 'Undefined identifier resolves to null');

  // C. Safe rejection of unmapped students on evidence submission
  const rejectedEvidence = await dbSubmitEvidence({
    student_id: 'UNKNOWN_USN_99999',
    title: 'Unauthorized Certificate Submission',
    skill_name: 'Security Testing',
    subject: 'cloud_aws',
    credential_url: 'https://example.com/unauthorized',
    description: 'Should never be stored.',
  });
  assert(rejectedEvidence === null, 'Evidence submission with unknown student identifier safely aborts without creating records');

  const rejectedUuidEvidence = await dbSubmitEvidence({
    student_id: '00000000-0000-0000-0000-000000000000',
    title: 'Unauthorized UUID Certificate',
    skill_name: 'Security Testing',
    subject: 'python',
    credential_url: 'https://example.com/invalid-uuid',
    description: 'Should never be stored.',
  });
  assert(rejectedUuidEvidence === null, 'Evidence submission with invalid UUID safely aborts without creating records');

  // D. Safe rejection of unauthorized assessment creation
  const rejectedAssessment = await dbSaveCertificateAssessment({
    submission_id: 'sub-test-unauthorized',
    student_id: '00000000-0000-0000-0000-000000000000',
    subject: 'python',
    submissions: perfectAnswers,
  });
  assert(rejectedAssessment.success === false, 'Assessment scoring safely rejects invalid/unmapped student identity');
  assert(rejectedAssessment.assessment === null, 'Assessment record is not created for invalid student');

  // E. Session authorization enforcement via validateStudentSession
  const mockReq = new Request('http://localhost:3000/api/evidence', { method: 'POST' });

  // Missing session check
  const missingSessionResult = await validateStudentSession(mockReq);
  assert(missingSessionResult.authorized === false, 'Rejects request when session is missing');
  assert(missingSessionResult.status === 401, 'Returns HTTP 401 Unauthorized for missing session');

  // Cross-user spoofing attempt check (Student A tries to supply Student B ID)
  const spoofingResult = await validateStudentSession(
    mockReq,
    'a0000003-0000-0000-0000-000000000001', // Pranav R
    { id: 'a0000001-0000-0000-0000-000000000001', email: 'preethika@nmamit.in' } // Preethika session
  );
  assert(spoofingResult.authorized === false, 'Blocks cross-student identity spoofing attempt');
  assert(spoofingResult.status === 403, 'Returns HTTP 403 Forbidden on student ID mismatch');

  // Legitimate session check
  const authorizedResult = await validateStudentSession(
    mockReq,
    'NNM24IS174', // Preethika's USN
    { id: 'a0000001-0000-0000-0000-000000000001', email: 'preethika@nmamit.in' } // Preethika session
  );
  assert(authorizedResult.authorized === true, 'Authorizes legitimate student session matching their identity');
  assert(authorizedResult.studentId === 'a0000001-0000-0000-0000-000000000001', 'Resolves to genuine authenticated student UUID');

  // F. Legitimate evidence submission succeeds strictly for THAT student
  const testSub = await dbSubmitEvidence({
    student_id: 'NNM24IS159',
    title: 'AWS Certified Solutions Architect – Automated Test',
    skill_name: 'Cloud Computing & AWS Architecture',
    subject: 'cloud_aws',
    issuer_or_organization: 'Amazon Web Services',
    credential_url: 'https://aws.amazon.com/verification/test-12345',
    type: 'certificate',
    description: 'Automated test suite certificate registration verification.',
  });

  assert(testSub !== null && Boolean(testSub.id), 'Successfully registers certificate evidence for verified student', `ID: ${testSub?.id}`);
  assert(testSub?.student_id === 'a0000003-0000-0000-0000-000000000001', 'Evidence is strictly bound to the authenticated student UUID');

  console.log('\n================================================================');
  console.log(`TEST RUN SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    throw new Error(`${failed} tests failed in certificate assessment suite.`);
  }
}

if (require.main === module) {
  runCertificateAssessmentTests().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
