import { NextResponse } from 'next/server';
import { dbGetPlacementDrives } from '@/lib/db';

export async function GET() {
  try {
    const drives = await dbGetPlacementDrives();
    return NextResponse.json({ drives, count: drives.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
