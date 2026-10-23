import { NextRequest, NextResponse } from 'next/server';
import { dbGetDriveApplications, dbUpdateApplicationStage, supabase, isSupabaseConfigured } from '@/lib/db';
import { ApplicationStage } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recruiter/applications?driveId=<driveId>
 * Fetches all drive applications for the selected placement drive from Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId');

    if (!driveId) {
      return NextResponse.json({ error: 'driveId is required' }, { status: 400 });
    }

    const applications = await dbGetDriveApplications(driveId);
    return NextResponse.json({ applications, count: applications.length });
  } catch (error: any) {
    console.error('Error fetching drive applications:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/recruiter/applications
 * Shortlists one or more candidates for a placement drive
 * Inserts or updates drive_applications with stage = 'shortlisted'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driveId, studentIds, notes } = body;

    if (!driveId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'driveId and a non-empty studentIds array are required' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { message: 'Offline mode: Shortlisted in memory', count: studentIds.length },
        { status: 200 }
      );
    }

    const now = new Date().toISOString();
    const upsertRows = studentIds.map((studentId: string) => ({
      drive_id: driveId,
      student_id: studentId,
      stage: 'shortlisted' as const,
      notes: notes || 'Shortlisted by recruiter from Candidate Pipeline desk.',
      applied_at: now,
      updated_at: now,
    }));

    const { data, error } = await supabase
      .from('drive_applications')
      .upsert(upsertRows, { onConflict: 'drive_id,student_id' })
      .select('*');

    if (error) {
      console.error('Error shortlisting candidates:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully shortlisted ${studentIds.length} candidate(s).`,
      applications: data,
      count: studentIds.length,
    });
  } catch (error: any) {
    console.error('Error in shortlisting POST:', error);
    return NextResponse.json({ error: error.message || 'Failed to shortlist' }, { status: 500 });
  }
}

/**
 * PATCH /api/recruiter/applications
 * Updates the candidate's stage, recruiter notes, and interview feedback
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, stage, notes, feedback } = body;

    if (!applicationId || !stage) {
      return NextResponse.json(
        { error: 'applicationId and stage are required.' },
        { status: 400 }
      );
    }

    // Supported database enum stages:
    // 'applied' | 'shortlisted' | 'interview_round_1' | 'offered' | 'placed' | 'accepted' | 'rejected'
    let dbStage = 'shortlisted';
    let finalNotes = notes || '';

    if (stage === 'interview_scheduled') {
      dbStage = 'interview_round_1';
    } else if (stage === 'interview_completed') {
      dbStage = 'interview_round_1';
      const feedbackPrefix = feedback ? `\n[Interview Feedback]: ${feedback}` : '';
      finalNotes = `[STAGE: Interview Completed] ${finalNotes}${feedbackPrefix}`.trim();
    } else if (stage === 'selected') {
      dbStage = 'offered';
    } else if (stage === 'shortlisted' || stage === 'applied' || stage === 'rejected') {
      dbStage = stage;
    }

    if (feedback && stage !== 'interview_completed') {
      finalNotes = `${finalNotes}\n[Feedback]: ${feedback}`.trim();
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        message: 'Application updated (offline mode)',
        application: { id: applicationId, stage: dbStage, notes: finalNotes },
      });
    }

    const { data, error } = await supabase
      .from('drive_applications')
      .update({
        stage: dbStage,
        notes: finalNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error) {
      console.error('dbUpdateApplicationStage error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Application stage and feedback updated successfully.',
      application: data,
    });
  } catch (error: any) {
    console.error('Error updating application stage:', error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

/**
 * DELETE /api/recruiter/applications?id=<applicationId>
 * Removes candidate from shortlist / applications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ message: 'Deleted (offline mode)' });
    }

    const { error } = await supabase
      .from('drive_applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Candidate removed from shortlist.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to remove' }, { status: 500 });
  }
}
