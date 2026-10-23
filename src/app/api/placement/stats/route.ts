import { NextResponse } from 'next/server';
import { dbGetPlacementStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await dbGetPlacementStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placement statistics' },
      { status: 500 }
    );
  }
}
