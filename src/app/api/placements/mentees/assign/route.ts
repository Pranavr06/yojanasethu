import { NextRequest, NextResponse } from 'next/server';
import {
  dbGetAllMentorsWithMenteeCounts,
  dbAssignMenteeToMentor,
  dbUnassignMentee,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await dbGetAllMentorsWithMenteeCounts();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('GET /api/placements/mentees/assign error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mentor allocation roster' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorId, studentId, assignedBy, notes } = body;

    if (!mentorId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'mentorId and studentId are required parameters' },
        { status: 400 }
      );
    }

    const result = await dbAssignMenteeToMentor({
      mentorId,
      studentId,
      assignedBy,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to assign mentee' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mentee assigned successfully to faculty mentor.',
    });
  } catch (error: any) {
    console.error('POST /api/placements/mentees/assign error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'student_id parameter is required' },
        { status: 400 }
      );
    }

    const result = await dbUnassignMentee(studentId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DELETE /api/placements/mentees/assign error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unassign mentee' },
      { status: 500 }
    );
  }
}
