import { NextRequest, NextResponse } from 'next/server';
import { dbGetRoadmap, dbToggleRoadmap } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) {
      return NextResponse.json({ tasks: [], count: 0 });
    }

    const tasks = await dbGetRoadmap(studentId);
    return NextResponse.json({ tasks, count: tasks.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const updated = await dbToggleRoadmap(taskId);
    if (!updated) {
      return NextResponse.json({ error: 'Roadmap task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
