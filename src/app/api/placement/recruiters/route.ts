import { NextRequest, NextResponse } from 'next/server';
import { dbAddRecruiterAndCompany, dbGetRecruiters } from '@/lib/db';
import { OnboardRecruiterPayload } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recruiters = await dbGetRecruiters();
    return NextResponse.json({
      success: true,
      recruiters,
      count: recruiters.length,
    });
  } catch (error: any) {
    console.error('GET /api/placement/recruiters error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch recruiters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OnboardRecruiterPayload;
    const { fullName, email, password, companyName } = body;

    // 1. Mandatory validation
    if (!fullName?.trim() || !email?.trim() || !password || !companyName?.trim()) {
      return NextResponse.json(
        { error: 'Recruiter Full Name, Email, Password, and Company Name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid corporate email address.' },
        { status: 400 }
      );
    }

    // 2. Database onboarding
    const result = await dbAddRecruiterAndCompany(body);

    if (!result.success || !result.recruiter) {
      return NextResponse.json(
        { error: result.error || 'Failed to onboard recruiter in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Recruiter account for ${result.recruiter.full_name} (${result.recruiter.company_name}) successfully provisioned and linked!`,
      recruiter: result.recruiter,
      company: result.company,
    });
  } catch (error: any) {
    console.error('POST /api/placement/recruiters error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while onboarding recruiter.' },
      { status: 500 }
    );
  }
}
