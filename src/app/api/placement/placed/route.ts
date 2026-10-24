import { NextRequest, NextResponse } from 'next/server';
import { dbGetPlacedStudents, dbGetStudentPlacementOffer } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdentifier = searchParams.get('student_id') || searchParams.get('usn') || undefined;

    const placedStudents = await dbGetPlacedStudents();

    let studentOffer = null;
    if (studentIdentifier) {
      studentOffer = await dbGetStudentPlacementOffer(studentIdentifier);
    }

    const totalPlaced = placedStudents.length;
    const highestPackage = placedStudents.reduce((max, s) => Math.max(max, s.ctc_lpa), 0);
    const averagePackage = totalPlaced > 0
      ? Number((placedStudents.reduce((acc, s) => acc + s.ctc_lpa, 0) / totalPlaced).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      total_placed: totalPlaced,
      highest_package: highestPackage,
      average_package: averagePackage,
      recent_placement: placedStudents[0] || null,
      placed_students: placedStudents,
      student_offer: studentOffer,
      is_placed: Boolean(studentOffer),
    });
  } catch (error: any) {
    console.error('GET /api/placement/placed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placed students' },
      { status: 500 }
    );
  }
}
