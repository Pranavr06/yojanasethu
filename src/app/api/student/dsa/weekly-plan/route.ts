import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyPlan, updateTaskCompletion } from '@/lib/dsa/dsaStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id') || 'student-mock-1';

    const tasks = await getWeeklyPlan(studentId);
    return NextResponse.json({ tasks: tasks || [] });
  } catch (error: any) {
    console.error('Error fetching weekly plan:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch weekly plan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id, task_id, completed } = body;

    const studentId = student_id || 'student-mock-1';

    if (!task_id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const success = await updateTaskCompletion(studentId, task_id, !!completed);

    return NextResponse.json({ success, completed: !!completed });
  } catch (error: any) {
    console.error('Error updating task completion:', error);
    return NextResponse.json({ error: error.message || 'Failed to update task completion' }, { status: 500 });
  }
}
