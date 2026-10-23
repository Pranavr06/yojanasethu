import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/db';
import { getSignedDocumentUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'documents';

function withTimeout<T>(promise: PromiseLike<T> | Promise<T>, ms: number, timeoutMsg: string): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms)),
  ]);
}

/**
 * GET /api/recruiter/resume?studentId=<id>&usn=<usn>
 * Retrieves a candidate's resume securely using the existing Supabase Storage bucket 'documents'.
 * Checks:
 *  1. evidence_submissions table for resume records (by path or title)
 *  2. Supabase Storage bucket 'documents/resumes/' prefix for uploaded files
 * Generates an authorized signed URL without exposing privileged service-role credentials.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const usn = searchParams.get('usn');

    if (!studentId && !usn) {
      return NextResponse.json(
        { error: 'studentId or usn is required to locate candidate resume.' },
        { status: 400 }
      );
    }

    let foundStoragePath: string | null = null;
    let foundFileName = 'Resume.pdf';
    let submissionTitle = 'Student Official Resume';
    let uploadedAt: string | null = null;

    // 1. Check evidence_submissions in database (with safety timeout)
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('evidence_submissions').select('*');
        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data: submissions, error: subErr } = await withTimeout<any>(
          query,
          3000,
          'Database query for candidate evidence submissions timed out.'
        );

        if (!subErr && submissions && submissions.length > 0) {
          const resumeSub = submissions.find((sub: any) => {
            const path = (sub.document_storage_path || '').toLowerCase();
            const url = (sub.credential_url || '').toLowerCase();
            const title = (sub.title || '').toLowerCase();
            const type = (sub.type || '').toLowerCase();

            return (
              path.includes('resumes/') ||
              url.includes('resumes/') ||
              path.endsWith('.pdf') ||
              title.includes('resume') ||
              title.includes('curriculum vitae') ||
              title.includes('cv') ||
              type === 'resume'
            );
          });

          if (resumeSub && (resumeSub.document_storage_path || resumeSub.credential_url)) {
            foundStoragePath = resumeSub.document_storage_path || resumeSub.credential_url;
            submissionTitle = resumeSub.title || 'Student Official Resume';
            uploadedAt = resumeSub.submitted_at || null;
            if (foundStoragePath) {
              const parts = foundStoragePath.split('/');
              foundFileName = parts[parts.length - 1] || 'Resume.pdf';
            }
          }
        }
      } catch (dbErr: any) {
        console.warn('Database query for resume failed:', dbErr.message);
      }
    }

    // 2. If not found in evidence_submissions, check Supabase Storage directly under resumes/
    if (!foundStoragePath && isSupabaseConfigured && supabase) {
      try {
        const identifier = usn || studentId || '';
        const listPromise = supabase.storage
          .from(STORAGE_BUCKET)
          .list('resumes', {
            limit: 20,
            search: identifier,
          });

        const { data: files, error: listErr } = await withTimeout<any>(
          listPromise,
          3500,
          'Supabase storage query timed out.'
        );

        if (!listErr && files && files.length > 0) {
          const match = files.find((f: any) => f.name.toLowerCase().endsWith('.pdf')) || files[0];
          if (match) {
            foundStoragePath = `resumes/${match.name}`;
            foundFileName = match.name;
            uploadedAt = match.created_at || null;
          }
        }
      } catch (storageErr: any) {
        console.warn('Storage list query for resume failed:', storageErr.message);
      }
    }

    // 3. If no resume was found anywhere, return a clear, honest state
    if (!foundStoragePath) {
      return NextResponse.json({
        hasResume: false,
        message: 'No resume uploaded by candidate.',
        studentId,
        usn,
      });
    }

    // 4. Securely generate a time-limited signed URL or streaming proxy
    const { signedUrl, cleanPath } = await getSignedDocumentUrl(foundStoragePath, 3600);
    const streamingUrl = `/api/recruiter/resume/file?path=${encodeURIComponent(cleanPath)}`;

    return NextResponse.json({
      hasResume: true,
      storagePath: cleanPath,
      fileName: foundFileName,
      title: submissionTitle,
      uploadedAt,
      viewUrl: signedUrl || streamingUrl,
      streamingUrl,
    });
  } catch (error: any) {
    console.error('Resume retrieval endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve resume' },
      { status: 500 }
    );
  }
}
