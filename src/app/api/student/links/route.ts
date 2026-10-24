import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import { dbGetStudentProfileLinks, dbSaveStudentProfileLinks, dbResolveStudentProfileId } from '@/lib/db';
import { StudentProfileLinks } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (clientSuppliedStudentId) {
        effectiveStudentId = (await dbResolveStudentProfileId(clientSuppliedStudentId)) || clientSuppliedStudentId;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111'; // Demo student Pranav R
      }
    }

    const links = await dbGetStudentProfileLinks(effectiveStudentId);
    return NextResponse.json({
      success: true,
      student_id: effectiveStudentId,
      links,
    });
  } catch (error: any) {
    console.error('GET /api/student/links error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student links' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkedin_url, github_url, leetcode_url, target_role, student_id } = body;

    const authResult = await validateStudentSession(request, student_id);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (student_id) {
        effectiveStudentId = (await dbResolveStudentProfileId(student_id)) || student_id;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    const payload: StudentProfileLinks = {
      linkedin_url: linkedin_url?.trim() || undefined,
      github_url: github_url?.trim() || undefined,
      leetcode_url: leetcode_url?.trim() || undefined,
      target_role: target_role?.trim() || 'Software Development Engineer',
    };

    const targetId: string = effectiveStudentId || "11111111-1111-1111-1111-111111111111";
    await dbSaveStudentProfileLinks(targetId, payload);

    return NextResponse.json({
      success: true,
      message: 'Student profile links saved successfully.',
      links: payload,
    });
  } catch (error: any) {
    console.error('PUT /api/student/links error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save student links' },
      { status: 500 }
    );
  }
}
