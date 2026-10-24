import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import { dbGetStudentUploadedResume, dbDeleteStudentUploadedResume, dbResolveStudentProfileId } from '@/lib/db';
import { deleteDocumentFromSupabaseStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    // 1. Authenticate student session
    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (clientSuppliedStudentId) {
        effectiveStudentId = (await dbResolveStudentProfileId(clientSuppliedStudentId)) || clientSuppliedStudentId;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    // 2. Fetch existing resume to get storage path
    const existingResume = await dbGetStudentUploadedResume(effectiveStudentId);
    if (!existingResume) {
      return NextResponse.json(
        { message: 'No permanent resume found to delete.' },
        { status: 200 }
      );
    }

    // 3. Delete file from Supabase Storage
    if (existingResume.storage_path) {
      await deleteDocumentFromSupabaseStorage(existingResume.storage_path);
    }

    // 4. Delete record from database
    await dbDeleteStudentUploadedResume(effectiveStudentId);

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully from storage and database.',
    });
  } catch (error: any) {
    console.error('Student resume delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete resume.' },
      { status: 500 }
    );
  }
}
