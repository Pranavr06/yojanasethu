import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRole, AppRole } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, role: rawRole, departmentId } = body;

    // 1. Validation
    if (!fullName || !email || !password || !rawRole) {
      return NextResponse.json(
        { error: 'All fields (Full Name, Email, Password, Role) are mandatory.' },
        { status: 400 }
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const normalizedRole = normalizeRole(rawRole);

    if (!normalizedRole) {
      return NextResponse.json({ error: 'Invalid application role selected.' }, { status: 400 });
    }

    // 2. Strict Admin Prevention
    if (normalizedRole === 'admin') {
      return NextResponse.json(
        { error: 'Security Violation: Administrator accounts cannot be self-provisioned via public signup.' },
        { status: 403 }
      );
    }

    // 3. Password Strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const isStudent = normalizedRole === 'student';
    const approvalStatus = isStudent ? 'approved' : 'pending';

    const adminSb = createAdminClient();

    // 4. Create user in Supabase Auth via admin client
    const { data: authData, error: authError } = await adminSb.auth.admin.createUser({
      email: emailTrimmed,
      password,
      email_confirm: true, // auto-confirm for immediate seamless experience
      user_metadata: {
        full_name: fullName.trim(),
        role: normalizedRole,
        approval_status: approvalStatus,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // 5. Initialize or Link Profile
    const profileRole =
      normalizedRole === 'mentor'
        ? 'faculty'
        : normalizedRole === 'placements'
        ? 'admin'
        : normalizedRole;

    const { error: profileError } = await adminSb.from('profiles').upsert(
      {
        id: newUserId,
        email: emailTrimmed,
        full_name: fullName.trim(),
        role: profileRole,
        institution_id: '11111111-0000-0000-0000-000000000001',
        department_id: departmentId || '22222222-0000-0000-0000-000000000001',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );

    if (profileError) {
      console.warn('Profile initialization note:', profileError.message);
    }

    // 6. Handle Role Assignment or Role Request
    if (isStudent) {
      // Direct student role assignment in user_roles if table exists
      try {
        await adminSb.from('user_roles').upsert({
          user_id: newUserId,
          role: 'student',
        });
      } catch (e) {
        // user_roles table may be pending migration
      }
    } else {
      // Privileged role request awaiting administrator verification
      try {
        await adminSb.from('role_requests').insert({
          user_id: newUserId,
          requested_role: normalizedRole,
          status: 'pending',
          full_name: fullName.trim(),
          email: emailTrimmed,
          institution_id: '11111111-0000-0000-0000-000000000001',
          department_id: departmentId || null,
        });
      } catch (e) {
        console.warn('Role request note:', e);
      }
    }

    // 7. Audit log creation
    try {
      await adminSb.from('audit_logs').insert({
        institution_id: '11111111-0000-0000-0000-000000000001',
        actor_id: newUserId,
        actor_role: normalizedRole,
        action: isStudent ? 'USER_SIGNUP_AUTO_APPROVED' : 'ROLE_REQUEST_SUBMITTED',
        target_entity: 'auth.users',
        target_id: newUserId,
        metadata: {
          email: emailTrimmed,
          requested_role: normalizedRole,
          approval_status: approvalStatus,
        },
      });
    } catch (e) {
      // Audit log optional fallback
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        email: emailTrimmed,
        role: normalizedRole,
        approvalStatus,
      },
      isPendingApproval: !isStudent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
