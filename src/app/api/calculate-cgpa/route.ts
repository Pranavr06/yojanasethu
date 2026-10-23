import { NextRequest, NextResponse } from 'next/server';
import { calculateTargetSgpa } from '@/lib/rulesEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentCgpa, targetCgpa, completedCredits, totalCredits } = body;

    if (currentCgpa === undefined || targetCgpa === undefined) {
      return NextResponse.json({ error: 'currentCgpa and targetCgpa are required.' }, { status: 400 });
    }

    const result = calculateTargetSgpa(
      Number(currentCgpa),
      Number(targetCgpa),
      completedCredits ? Number(completedCredits) : 120,
      totalCredits ? Number(totalCredits) : 160
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
