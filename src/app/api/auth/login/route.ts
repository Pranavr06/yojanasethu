import { NextRequest, NextResponse } from 'next/server';
import { dbGetProfileByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const profile = await dbGetProfileByEmail(email);
    if (!profile) {
      return NextResponse.json(
        { error: 'No account found with this email in the college registry.' },
        { status: 401 }
      );
    }

    // Default password for seeded users is 'password123'
    if (password && password !== 'password123') {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: profile,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
