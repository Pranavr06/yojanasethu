import { NextRequest, NextResponse } from 'next/server';
import { uploadDocumentToS3 } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'resumes' | 'certificates') || 'certificates';
    const studentIdOrUsn = (formData.get('studentId') as string) || 'NNM24IS159';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded. Please select a PDF document.' }, { status: 400 });
    }

    // Validate file type
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF documents (.pdf) are permitted for resumes and certificates.' },
        { status: 400 }
      );
    }

    // 10MB file limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit of 10MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadDocumentToS3({
      fileBuffer: buffer,
      fileName: file.name,
      contentType: file.type || 'application/pdf',
      folder,
      studentIdOrUsn,
    });

    return NextResponse.json({
      message: 'Document uploaded to S3 bucket successfully!',
      document_storage_path: uploadResult.documentStoragePath,
      file_url: uploadResult.fileUrl,
      file_name: uploadResult.fileName,
      file_size: uploadResult.fileSize,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
