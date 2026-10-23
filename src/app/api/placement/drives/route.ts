import { NextRequest, NextResponse } from 'next/server';
import { dbGetPlacementDrivesWithEligibility, dbCreatePlacementDrive } from '@/lib/db';

export async function GET() {
  try {
    const drives = await dbGetPlacementDrivesWithEligibility();
    return NextResponse.json({ drives });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch placement drives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, role_title, ctc_lpa, min_cgpa } = body;

    if (!company_name || !role_title || !ctc_lpa || !min_cgpa) {
      return NextResponse.json(
        { error: 'company_name, role_title, ctc_lpa, and min_cgpa are required' },
        { status: 400 }
      );
    }

    const drive = await dbCreatePlacementDrive(body);
    return NextResponse.json({ success: true, drive }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create placement drive' },
      { status: 500 }
    );
  }
}
