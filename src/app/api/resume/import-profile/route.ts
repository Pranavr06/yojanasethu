import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import {
  dbGetFullStudent,
  dbBuildDefaultResumeFromProfile,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student_id') || searchParams.get('usn');

    // Authenticate student session
    const authResult = await validateStudentSession(request, studentIdParam || undefined);
    const identifier = authResult.studentId || studentIdParam || '11111111-1111-1111-1111-111111111111';

    // Fetch full profile from database / cohort records
    const student = await dbGetFullStudent(identifier);

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found in institutional database.' },
        { status: 404 }
      );
    }

    // Convert into structured ResumeData
    const defaultResume = dbBuildDefaultResumeFromProfile(student);

    return NextResponse.json({
      success: true,
      resumeData: defaultResume,
      studentProfile: {
        id: student.profile.id,
        fullName: student.profile.full_name,
        usn: student.profile.usn,
        email: student.profile.email,
        phone: student.profile.phone,
        department: student.profile.department_code,
        semester: student.profile.semester,
        cgpa: student.academic_record?.cgpa,
        isVerified: student.academic_record?.is_verified_by_exam_cell,
        skillsCount: student.skills?.length || 0,
        submissionsCount: student.evidence_submissions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/resume/import-profile:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to import student profile' },
      { status: 500 }
    );
  }
}
