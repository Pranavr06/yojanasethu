import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRole } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    const adminSb = createAdminClient();

    // Try fetching from role_requests table
    const { data: requests, error } = await adminSb
      .from('role_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty list or fallback from auth users with pending status
      const { data: authUsers } = await adminSb.auth.admin.listUsers();
      const pendingUsers = authUsers.users
        .filter((u) => u.user_metadata?.approval_status === 'pending')
        .map((u) => ({
          id: u.id,
          user_id: u.id,
          full_name: u.user_metadata?.full_name || u.email,
          email: u.email,
          requested_role: u.user_metadata?.role,
          status: 'pending',
          created_at: u.created_at,
        }));

      return NextResponse.json({ requests: pendingUsers });
    }

    return NextResponse.json({ requests });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userId, action, adminNotes } = body;

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Valid userId and action (approve/reject) required.' }, { status: 400 });
    }

    const adminSb = createAdminClient();

    // 1. Fetch user to find requested role
    const { data: userData, error: userError } = await adminSb.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'User not found in authentication system.' }, { status: 404 });
    }

    const user = userData.user;
    const requestedRole = normalizeRole(user.user_metadata?.role) || 'student';
    const status = action === 'approve' ? 'approved' : 'rejected';

    // 2. Update user metadata in Supabase Auth
    await adminSb.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        approval_status: status,
        role: action === 'approve' ? requestedRole : 'student',
      },
    });

    // 3. Update or Insert into user_roles if approved
    if (action === 'approve') {
      try {
        await adminSb.from('user_roles').upsert({
          user_id: userId,
          role: requestedRole,
        });
      } catch (e) {
        // user_roles pending migration
      }

      // 4. Update profile role
      const profileRole =
        requestedRole === 'mentor' ? 'faculty' : requestedRole === 'placements' ? 'admin' : requestedRole;
      try {
        await adminSb
          .from('profiles')
          .update({ role: profileRole, updated_at: new Date().toISOString() })
          .eq('email', user.email);
      } catch (e) {
        // profile table update
      }
    }

    // 5. Update role_requests table if present
    if (requestId) {
      try {
        await adminSb
          .from('role_requests')
          .update({
            status,
            admin_notes: adminNotes || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', requestId);
      } catch (e) {
        // role_requests pending migration
      }
    }

    // 6. Audit log
    try {
      await adminSb.from('audit_logs').insert({
        institution_id: '11111111-0000-0000-0000-000000000001',
        actor_role: 'admin',
        action: action === 'approve' ? 'ROLE_REQUEST_APPROVED' : 'ROLE_REQUEST_REJECTED',
        target_entity: 'auth.users',
        target_id: userId,
        metadata: {
          email: user.email,
          role: requestedRole,
          status,
          admin_notes: adminNotes,
        },
      });
    } catch (e) {
      // audit log fallback
    }

    return NextResponse.json({
      success: true,
      status,
      role: action === 'approve' ? requestedRole : 'student',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
