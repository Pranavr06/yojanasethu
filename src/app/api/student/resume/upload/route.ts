import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import { uploadDocumentToSupabaseStorage } from '@/lib/storage';
import { dbSaveStudentUploadedResume, dbResolveStudentProfileId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientSuppliedStudentId = (formData.get('student_id') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided. Please upload a PDF document.' },
        { status: 400 }
      );
    }

    // 1. Validate file format: strictly PDF for permanent student resume
    const fileName = file.name || 'Resume.pdf';
    const isPdf =
      file.type === 'application/pdf' ||
      fileName.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF documents (.pdf) are permitted for official resumes.' },
        { status: 400 }
      );
    }

    // 2. Validate file size limit: 15 MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Resume file size exceeds maximum limit of 15MB.' },
        { status: 400 }
      );
    }

    // 3. Authenticate student session
    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      // In dev/demo or if client supplied a valid student identifier:
      if (clientSuppliedStudentId) {
        effectiveStudentId = (await dbResolveStudentProfileId(clientSuppliedStudentId)) || clientSuppliedStudentId;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111'; // Default demo student Pranav R
      }
    }

    // 4. Convert file to Buffer and upload to Supabase Storage ('documents/resumes')
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadDocumentToSupabaseStorage({
      fileBuffer: buffer,
      fileName,
      contentType: 'application/pdf',
      folder: 'resumes',
      studentIdOrUsn: effectiveStudentId,
    });

    // Format human-readable file size (e.g. "1.2 MB")
    const sizeInKb = Math.round(file.size / 1024);
    const humanSize = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    // 5. Permanently record in student_uploaded_resumes and update profiles table
    const savedResume = await dbSaveStudentUploadedResume(effectiveStudentId, {
      storage_path: uploadResult.documentStoragePath,
      file_name: uploadResult.fileName,
      file_size: humanSize,
      content_type: 'application/pdf',
    });

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and stored permanently.',
      resume: savedResume,
    });
  } catch (error: any) {
    console.error('Student resume upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload permanent resume.' },
      { status: 500 }
    );
  }
}
