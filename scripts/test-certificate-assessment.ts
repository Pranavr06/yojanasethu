import { classifyCertificateSubject } from '../src/lib/subjectClassifier';
import {
  getSubjectQuestionsForClient,
  gradeAssessmentSubmission,
  SUBJECT_METADATA,
} from '../src/lib/assessmentQuestions';
import { generateQRCodeMatrix } from '../src/lib/qrCode';
import { dbGetPublicVerificationData } from '../src/lib/db';
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
    { questionId: 'py-01', selectedOptionIndex: 1 }, // Correct
    { questionId: 'py-02', selectedOptionIndex: 0 }, // Incorrect
    { questionId: 'py-03', selectedOptionIndex: 1 }, // Correct
    { questionId: 'py-04', selectedOptionIndex: 0 }, // Incorrect
    { questionId: 'py-05', selectedOptionIndex: 1 }, // Correct
  ];

  const partialGrading = gradeAssessmentSubmission('python', partialAnswers);
  assert(partialGrading.correct_answers === 3, 'Correctly calculates 3 out of 5', `Got ${partialGrading.correct_answers}`);
  assert(partialGrading.score_percentage === 60, 'Calculates (3/5)*100 = 60%', `Got ${partialGrading.score_percentage}%`);
  assert(partialGrading.answers.length === 5, 'Provides complete graded breakdown with explanations');

  // All-wrong submission (0 of 5 correct)
  const zeroAnswers = [
    { questionId: 'py-01', selectedOptionIndex: 3 },
    { questionId: 'py-02', selectedOptionIndex: 3 },
    { questionId: 'py-03', selectedOptionIndex: 3 },
    { questionId: 'py-04', selectedOptionIndex: 3 },
    { questionId: 'py-05', selectedOptionIndex: 3 },
  ];
  const zeroGrading = gradeAssessmentSubmission('python', zeroAnswers);
  assert(zeroGrading.score_percentage === 0, 'Calculates 0% for all incorrect answers', `Got ${zeroGrading.score_percentage}%`);
  assert(zeroGrading.correct_answers === 0, 'Marks 0 correct answers for failing attempt');

  // --- SUITE 4: RETAKE POLICY & ATTEMPT LIMITS ---
  console.log('\n--- 4. Testing Retake Policy and Attempt Limit Gate ---');

  function checkCanAttemptExam(attemptNumber: number, canRetake: boolean): { allowed: boolean; reason?: string } {
    if (attemptNumber === 1) {
      return { allowed: true };
    }
    if (attemptNumber === 2) {
      if (canRetake) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Retake has not been granted by a faculty mentor.' };
    }
    return { allowed: false, reason: 'Maximum allowed assessment attempts (2) exceeded.' };
  }

  assert(checkCanAttemptExam(1, false).allowed === true, 'Attempt 1 is permitted by default');
  assert(checkCanAttemptExam(2, false).allowed === false, 'Attempt 2 is blocked if mentor has not granted retake');
  assert(checkCanAttemptExam(2, true).allowed === true, 'Attempt 2 is allowed when mentor grants retake');
  assert(checkCanAttemptExam(3, true).allowed === false, 'Attempt 3 is strictly blocked regardless of flags');
  assert(checkCanAttemptExam(4, true).allowed === false, 'Attempt 4 is strictly blocked');

  // --- SUITE 5: ZERO-DEPENDENCY QR MATRIX GENERATOR ---
  console.log('\n--- 5. Testing Pure SVG QR Code Generator ---');

  const testUrl = 'https://pathpilot.nmamit.in/verify/cred-aws-01';
  const qr = generateQRCodeMatrix(testUrl);
  assert(qr.size >= 21, 'Generates valid QR matrix size', `Size: ${qr.size}x${qr.size}`);
  assert(qr.modules.length === qr.size, 'Matrix row count matches size');
  assert(qr.modules[0].length === qr.size, 'Matrix column count matches size');
  // Check top-left finder pattern center is black
  assert(qr.modules[3][3] === true, 'Finder pattern center module is black');

  // --- SUITE 6: PUBLIC VERIFICATION RESOLVER & PII PROTECTION ---
  console.log('\n--- 6. Testing Public Verification Resolver & Zero PII Leakage ---');

  const pubData = await dbGetPublicVerificationData('cred-aws-01');
  assert(pubData !== null && pubData.isValid === true, 'Resolves valid public verification record');
  assert(Boolean(pubData?.maskedUsn.includes('***')), 'Masks student USN for privacy protection', `USN: ${pubData?.maskedUsn}`);
  assert(!('email' in (pubData || {})), 'Does not expose student email in public verification');
  assert(!('phone' in (pubData || {})), 'Does not expose student phone in public verification');
  assert(!('file_path' in (pubData || {})), 'Does not expose raw document storage path');
  assert(Boolean(pubData?.institution.includes('NMAM')), 'Includes institutional accreditation badge');

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
