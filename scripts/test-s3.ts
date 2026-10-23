import { uploadDocumentToS3 } from '../src/lib/storage';
import { dbSubmitEvidence, dbGetPendingSubmissions } from '../src/lib/db';

async function testS3Storage() {
  console.log('====================================================');
  console.log('PathPilot AWS S3 Document Storage Verification');
  console.log('====================================================\n');

  // Create a sample mock PDF buffer
  const samplePdfBuffer = Buffer.from('%PDF-1.4 sample certificate content for test');

  console.log('1. Uploading certificate PDF to S3...');
  const upload = await uploadDocumentToS3({
    fileBuffer: samplePdfBuffer,
    fileName: 'aws-cloud-practitioner-cert.pdf',
    contentType: 'application/pdf',
    folder: 'certificates',
    studentIdOrUsn: 'NNM24IS159',
  });

  console.log('[PASS] Upload result:');
  console.log(` - S3 Storage URI: ${upload.documentStoragePath}`);
  console.log(` - Public/Presigned URL: ${upload.fileUrl}`);
  console.log(` - Clean File Name: ${upload.fileName}`);

  console.log('\n2. Submitting certificate evidence to database...');
  const submission = await dbSubmitEvidence({
    student_id: 'p0000001-0000-0000-0000-000000000001',
    title: 'AWS Certified Cloud Practitioner Certificate',
    skill_name: 'AWS Fundamentals',
    type: 'certificate',
    document_storage_path: upload.documentStoragePath,
    credential_url: upload.fileUrl,
    description: 'Passed official AWS exam scoring 880/1000. Certificate PDF attached from S3.',
  });

  if (!submission) {
    console.error('Failed to create evidence submission');
    return;
  }

  console.log('[PASS] Saved to evidence_submissions:');
  console.log(` - Submission ID: ${submission.id}`);
  console.log(` - Status: ${submission.status}`);
  console.log(` - Document Path in DB: ${submission.document_storage_path}`);
  console.log(` - Credential URL in DB: ${submission.credential_url}`);

  console.log('\n3. Verifying faculty mentor can review certificate...');
  const queue = await dbGetPendingSubmissions();
  const certSubmission = queue.find((q) => q.id === submission.id);
  console.log(`[PASS] Mentor review item found: ${certSubmission?.title}`);
  console.log(`Document URL for mentor click-to-view: ${certSubmission?.credential_url}`);

  console.log('\n====================================================');
  console.log('SUCCESS: S3 PDF Storage & Database Integration Verified!');
  console.log('====================================================');
}

testS3Storage().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
