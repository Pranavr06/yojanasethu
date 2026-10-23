import { NextRequest, NextResponse } from 'next/server';
import { dbGetDriveApplications, dbUpdateApplicationStage } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId') || undefined;

    const applications = await dbGetDriveApplications(driveId);
    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch drive applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, stage } = body;

    if (!applicationId || !stage) {
      return NextResponse.json(
        { error: 'applicationId and stage are required' },
        { status: 400 }
      );
    }

    const updated = await dbUpdateApplicationStage(applicationId, stage);
    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update application stage' },
      { status: 500 }
    );
  }
}
