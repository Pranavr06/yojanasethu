import { NextRequest, NextResponse } from 'next/server';
import { dbGetAcademicCorrectionRequests, dbResolveAcademicCorrectionRequest } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const requests = await dbGetAcademicCorrectionRequests(status);
    return NextResponse.json({
      requests,
      count: requests.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id || !['resolved', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json(
        { error: 'id and valid status (resolved | rejected | under_review) are required.' },
        { status: 400 }
      );
    }

    const success = await dbResolveAcademicCorrectionRequest({
      id,
      status,
      admin_notes,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to update correction request' }, { status: 500 });
    }

    return NextResponse.json({
      message: status === 'resolved'
        ? 'Correction request approved and synchronized with Contineo ERP.'
        : 'Correction request updated.',
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
