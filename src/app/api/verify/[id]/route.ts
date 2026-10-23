import { NextRequest, NextResponse } from 'next/server';
import { dbGetPublicVerificationData } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Credential ID is required' }, { status: 400 });
    }

    const verificationData = await dbGetPublicVerificationData(id);

    if (!verificationData) {
      return NextResponse.json(
        { error: 'Credential not found or not publicly verifiable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verification: verificationData,
      verified_at_timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
