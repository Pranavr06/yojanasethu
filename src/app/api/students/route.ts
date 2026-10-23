import { NextRequest, NextResponse } from 'next/server';
import { dbGetAllStudents, dbGetFullStudent } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const usn = searchParams.get('usn');

    if (id || usn) {
      const student = await dbGetFullStudent((id || usn)!);
      if (!student) {
        return NextResponse.json({ error: 'Student record not found in Contineo ERP database' }, { status: 404 });
      }
      return NextResponse.json({ student });
    }

    const students = await dbGetAllStudents();
    return NextResponse.json({ students, count: students.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
