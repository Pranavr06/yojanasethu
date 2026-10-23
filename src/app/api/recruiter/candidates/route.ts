import { NextRequest, NextResponse } from 'next/server';
import { dbGetPlacementDrives, dbGetAllStudents } from '@/lib/db';
import { evaluateDriveCandidate } from '@/lib/rulesEngine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driveId = searchParams.get('driveId');

    const drives = await dbGetPlacementDrives();
    const selectedDrive = driveId ? drives.find((d) => d.id === driveId) || drives[0] : drives[0];

    if (!selectedDrive) {
      return NextResponse.json({
        drive: null,
        total_evaluated: 0,
        eligible_count: 0,
        ineligible_count: 0,
        eligible_candidates: [],
        ineligible_candidates: [],
      });
    }

    const allStudents = await dbGetAllStudents();
    // Respect student privacy: only include students who opted in (recruiter_consent = true)
    const consentedStudents = allStudents.filter((s) => s.profile.recruiter_consent);

    const evaluations = consentedStudents.map((student) =>
      evaluateDriveCandidate(student, selectedDrive)
    );

    const eligible = evaluations
      .filter((e) => e.is_eligible)
      .sort((a, b) => b.match_score - a.match_score);

    const ineligible = evaluations.filter((e) => !e.is_eligible);

    return NextResponse.json({
      drive: selectedDrive,
      total_evaluated: consentedStudents.length,
      eligible_count: eligible.length,
      ineligible_count: ineligible.length,
      eligible_candidates: eligible,
      ineligible_candidates: ineligible,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
