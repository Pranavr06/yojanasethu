import { NextRequest, NextResponse } from 'next/server';
import { dbSubmitEvidence } from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      student_id,
      title,
      skill_name,
      github_repo_url,
      document_storage_path,
      credential_url,
      type,
      subject,
      issuer_or_organization,
      description,
    } = body;

    // 1. Session verification & student identity validation
    const authResult = await validateStudentSession(request, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required to submit certificates.' },
        { status: authResult.status || 401 }
      );
    }

    if (!title || !skill_name) {
      return NextResponse.json(
        { error: 'title and skill_name are mandatory fields.' },
        { status: 400 }
      );
    }

    // Must have either GitHub URL, an uploaded PDF document, or verification URL
    if (!github_repo_url && !document_storage_path && !credential_url) {
      return NextResponse.json(
        { error: 'Must provide either an uploaded certificate document, an online verification URL, or a GitHub repository URL.' },
        { status: 400 }
      );
    }

    // Submit evidence strictly linked to authenticated student UUID
    const submission = await dbSubmitEvidence({
      student_id: authResult.studentId,
      title,
      skill_name,
      github_repo_url,
      document_storage_path,
      credential_url,
      type: type || (document_storage_path ? 'certificate' : 'project'),
      subject,
      issuer_or_organization,
      description: description || 'Submitted for faculty mentor review.',
    });

    if (!submission || !submission.id) {
      return NextResponse.json(
        { error: 'Failed to record evidence submission in database. Profile could not be verified or database unavailable.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Evidence submitted successfully! Status set to pending faculty review.',
        submission,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/evidence error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during evidence registration.' },
      { status: 500 }
    );
  }
}
