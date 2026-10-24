import { NextRequest, NextResponse } from 'next/server';
import { analyzeDriveWithGemini } from '@/lib/geminiDriveAnalyzer';
import { dbGetPlacementDrives } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId') || '';
    const studentId = searchParams.get('studentId') || undefined;

    let targetDriveId = driveId;
    if (!targetDriveId) {
      const drives = await dbGetPlacementDrives();
      if (drives.length > 0) {
        targetDriveId = drives[0].id;
      }
    }

    if (!targetDriveId) {
      return NextResponse.json({ error: 'No placement drives found' }, { status: 404 });
    }

    const analysis = await analyzeDriveWithGemini(targetDriveId, studentId);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('GET /api/placement/ai-drive-analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Gemini AI drive analysis' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { driveId, studentId } = body;

    if (!driveId) {
      return NextResponse.json({ error: 'driveId is required' }, { status: 400 });
    }

    const analysis = await analyzeDriveWithGemini(driveId, studentId);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('POST /api/placement/ai-drive-analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Gemini AI drive analysis' },
      { status: 500 }
    );
  }
}
