import { NextResponse } from 'next/server';
import { dbGetPendingSubmissions } from '@/lib/db';

export async function GET() {
  try {
    const queue = await dbGetPendingSubmissions();
    return NextResponse.json({
      pending_submissions: queue,
      count: queue.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
