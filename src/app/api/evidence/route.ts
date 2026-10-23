import { NextRequest, NextResponse } from 'next/server';
import { dbSubmitEvidence } from '@/lib/db';

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
      description,
    } = body;

    if (!student_id || !title || !skill_name) {
      return NextResponse.json(
        { error: 'student_id, title, and skill_name are mandatory.' },
        { status: 400 }
      );
    }

    // Must have either GitHub URL or an uploaded PDF document in S3
    if (!github_repo_url && !document_storage_path && !credential_url) {
      return NextResponse.json(
        { error: 'Must provide either a GitHub repository URL or an uploaded document storage path.' },
        { status: 400 }
      );
    }

    const submission = await dbSubmitEvidence({
      student_id,
      title,
      skill_name,
      github_repo_url,
      document_storage_path,
      credential_url,
      type: type || (document_storage_path ? 'certificate' : 'github_repo'),
      description: description || 'Submitted for faculty mentor review.',
    });

    return NextResponse.json({
      message: 'Evidence submitted successfully! Status set to pending faculty review.',
      submission,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
