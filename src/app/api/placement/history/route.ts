import { NextResponse } from 'next/server';
import { dbGetHistoricalPlacementStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const historicalStats = await dbGetHistoricalPlacementStats();
    return NextResponse.json({ stats: historicalStats });
  } catch (error: any) {
    console.error('GET /api/placement/history error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch historical placement stats' },
      { status: 500 }
    );
  }
}
