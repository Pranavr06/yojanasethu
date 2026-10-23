import { NextRequest, NextResponse } from 'next/server';
import { uploadDocumentToS3 } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as 'resumes' | 'certificates') || 'certificates';
    const studentIdOrUsn = (formData.get('studentId') as string) || 'NNM24IS159';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded. Please select a document or image.' }, { status: 400 });
    }

    // Validate file type (supports PDF and standard certificate images)
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    const isAllowedType =
      file.type === 'application/pdf' ||
      file.type.startsWith('image/') ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isAllowedType) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF documents (.pdf) and images (.png, .jpg, .jpeg) are permitted.' },
        { status: 400 }
      );
    }

    // 15MB file limit
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit of 15MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadDocumentToS3({
      fileBuffer: buffer,
      fileName: file.name,
      contentType: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      folder,
      studentIdOrUsn,
    });

    return NextResponse.json({
      message: 'Document uploaded to storage bucket successfully!',
      document_storage_path: uploadResult.documentStoragePath,
      file_url: uploadResult.fileUrl,
      file_name: uploadResult.fileName,
      file_size: uploadResult.fileSize,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
