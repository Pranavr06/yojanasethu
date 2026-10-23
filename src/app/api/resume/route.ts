import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import {
  dbGetStudentResumes,
  dbGetStudentResumeById,
  dbSaveStudentResume,
  dbDeleteStudentResume,
} from '@/lib/db';
import { ResumeData, ResumeTemplateType, ResumeAnalysisResult } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');
    const studentIdParam = searchParams.get('student_id');

    // Authenticate student session
    const authResult = await validateStudentSession(request, studentIdParam || undefined);
    const effectiveStudentId = authResult.studentId || studentIdParam || '11111111-1111-1111-1111-111111111111';

    if (resumeId) {
      const resume = await dbGetStudentResumeById(resumeId, effectiveStudentId);
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      return NextResponse.json({ resume });
    }

    const resumes = await dbGetStudentResumes(effectiveStudentId);
    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error('Error in GET /api/resume:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title = 'My Technical Resume',
      target_role = 'Software Development Engineer',
      target_job_description,
      template = 'modern',
      resume_data,
      analysis_result,
      student_id,
    }: {
      id?: string;
      title?: string;
      target_role?: string;
      target_job_description?: string;
      template?: ResumeTemplateType;
      resume_data: ResumeData;
      analysis_result?: ResumeAnalysisResult | null;
      student_id?: string;
    } = body;

    if (!resume_data) {
      return NextResponse.json(
        { error: 'Invalid request: resume_data is required.' },
        { status: 400 }
      );
    }

    // Authenticate student session
    const authResult = await validateStudentSession(request, student_id);
    const effectiveStudentId = authResult.studentId || student_id || '11111111-1111-1111-1111-111111111111';

    const saved = await dbSaveStudentResume({
      id,
      student_id: effectiveStudentId,
      title,
      target_role,
      target_job_description,
      template,
      resume_data,
      analysis_result,
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to persist resume in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, resume: saved });
  } catch (error: any) {
    console.error('Error in POST /api/resume:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to save resume' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('id');
    const studentIdParam = searchParams.get('student_id');

    if (!resumeId) {
      return NextResponse.json(
        { error: 'Resume id is required for deletion.' },
        { status: 400 }
      );
    }

    // Authenticate student session
    const authResult = await validateStudentSession(request, studentIdParam || undefined);
    const effectiveStudentId = authResult.studentId || studentIdParam || '11111111-1111-1111-1111-111111111111';

    const deleted = await dbDeleteStudentResume(resumeId, effectiveStudentId);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error('Error in DELETE /api/resume:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
