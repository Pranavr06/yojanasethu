import { NextRequest, NextResponse } from 'next/server';
import {
  dbGetPlacementAnnouncements,
  dbGetPlacementAnnouncementById,
  dbCreatePlacementAnnouncement,
  dbUpdatePlacementAnnouncement,
  dbArchivePlacementAnnouncement,
} from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { normalizeRole } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status') || undefined;
    const batchParam = searchParams.get('batch');
    const branch = searchParams.get('branch') || undefined;
    const search = searchParams.get('search') || undefined;

    if (id) {
      const announcement = await dbGetPlacementAnnouncementById(id);
      if (!announcement) {
        return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
      }
      return NextResponse.json({ announcement });
    }

    const batch = batchParam ? parseInt(batchParam, 10) : undefined;
    const announcements = await dbGetPlacementAnnouncements({
      status,
      batch: !isNaN(batch as number) ? batch : undefined,
      branch,
      search,
    });

    return NextResponse.json({
      announcements,
      count: announcements.length,
    });
  } catch (error: any) {
    console.error('GET /api/placement/announcements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. RBAC authorization check
    let authorized = false;
    let authorUserId: string | undefined;

    try {
      const serverSb = createClient();
      const {
        data: { user },
      } = await serverSb.auth.getUser();

      if (user) {
        authorUserId = user.id;
        const role = normalizeRole(
          (user.user_metadata?.role as string) || (user.app_metadata?.role as string)
        );
        if (role === 'placements' || role === 'admin') {
          authorized = true;
        }
      }
    } catch {
      // In dev or sandbox environment without active cookies, allow fallback if authorized role header supplied
    }

    // Support role verification via custom header for demo/TPO portal
    const roleHeader = request.headers.get('x-user-role');
    if (roleHeader && (roleHeader === 'placements' || roleHeader === 'admin' || roleHeader === 'placement')) {
      authorized = true;
    }

    // For local dev/demonstration environments, grant permission if auth cookies not yet written
    if (!authorized && process.env.NODE_ENV !== 'production') {
      authorized = true;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Only Placement Officers and Administrators can publish announcements' },
        { status: 403 }
      );
    }

    // 2. Body validation
    const body = await request.json();
    const {
      company_name,
      role_title,
      job_description,
      ctc_lpa,
      registration_deadline,
      eligible_branches,
      eligible_batches,
    } = body;

    if (!company_name?.trim()) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    if (!role_title?.trim()) {
      return NextResponse.json({ error: 'Role title is required' }, { status: 400 });
    }
    if (!job_description?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }
    if (ctc_lpa === undefined || isNaN(Number(ctc_lpa)) || Number(ctc_lpa) < 0) {
      return NextResponse.json({ error: 'Valid numeric CTC package (in LPA) is required' }, { status: 400 });
    }
    if (!registration_deadline) {
      return NextResponse.json({ error: 'Registration deadline date is required' }, { status: 400 });
    }

    // Date consistency check
    const deadlineDate = new Date(registration_deadline);
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json({ error: 'Invalid registration deadline format' }, { status: 400 });
    }

    if (body.registration_open_date) {
      const openDate = new Date(body.registration_open_date);
      if (!isNaN(openDate.getTime()) && openDate > deadlineDate) {
        return NextResponse.json(
          { error: 'Registration open date cannot be after registration deadline' },
          { status: 400 }
        );
      }
    }

    // URL validation if supplied
    if (body.application_link && body.application_link.trim()) {
      const link = body.application_link.trim();
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        return NextResponse.json(
          { error: 'Application link must be a valid URL starting with http:// or https://' },
          { status: 400 }
        );
      }
    }

    const created = await dbCreatePlacementAnnouncement(
      {
        ...body,
        company_name: company_name.trim(),
        role_title: role_title.trim(),
        job_description: job_description.trim(),
        ctc_lpa: Number(ctc_lpa),
        eligible_branches: Array.isArray(eligible_branches) ? eligible_branches : ['ISE', 'CSE', 'AIML'],
        eligible_batches: Array.isArray(eligible_batches) ? eligible_batches.map(Number) : [2026],
      },
      authorUserId
    );

    if (!created) {
      return NextResponse.json({ error: 'Failed to create announcement record' }, { status: 500 });
    }

    return NextResponse.json({ success: true, announcement: created }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/placement/announcements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const updated = await dbUpdatePlacementAnnouncement(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Announcement not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    console.error('PATCH /api/placement/announcements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required' }, { status: 400 });
    }

    const success = await dbArchivePlacementAnnouncement(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('DELETE /api/placement/announcements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive announcement' },
      { status: 500 }
    );
  }
}
