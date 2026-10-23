import { NextResponse } from 'next/server';
import { dbGetPlacementCalendarEvents } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await dbGetPlacementCalendarEvents();
    return NextResponse.json({ events, count: events.length });
  } catch (error: any) {
    console.error('GET /api/placement/calendar error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placement calendar events' },
      { status: 500 }
    );
  }
}
