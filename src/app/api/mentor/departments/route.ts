import { NextResponse } from 'next/server';
import { dbGetDepartments } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const departments = await dbGetDepartments();
    return NextResponse.json({ departments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
