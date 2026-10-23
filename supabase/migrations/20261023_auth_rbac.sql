-- ========================================================
-- YojanaSethu RBAC & Authentication Schema Migration
-- Roles: student, mentor, recruiter, admin, placements
-- ========================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE USER_ROLES TABLE
-- Enforces one primary role per user with strict role constraint
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'mentor', 'recruiter', 'admin', 'placements')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 3. CREATE ROLE_REQUESTS TABLE (Approval Workflow)
-- For mentor, recruiter, placements roles requested through signup
CREATE TABLE IF NOT EXISTS public.role_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('student', 'mentor', 'recruiter', 'admin', 'placements')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    full_name TEXT,
    email TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    organization_name TEXT,
    notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_requests_user ON public.role_requests(user_id);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR USER_ROLES
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- 6. RLS POLICIES FOR ROLE_REQUESTS
DROP POLICY IF EXISTS "Users can view own role requests" ON public.role_requests;
CREATE POLICY "Users can view own role requests"
    ON public.role_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own role requests" ON public.role_requests;
CREATE POLICY "Users can create their own role requests"
    ON public.role_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all role requests" ON public.role_requests;
CREATE POLICY "Admins can manage all role requests"
    ON public.role_requests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- 7. FUNCTION: Assign Role on Approval
CREATE OR REPLACE FUNCTION public.approve_role_request(
    request_id UUID,
    reviewer_user_id UUID,
    notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_request RECORD;
BEGIN
    SELECT * INTO target_request FROM public.role_requests WHERE id = request_id AND status = 'pending';
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Update request status
    UPDATE public.role_requests
    SET status = 'approved',
        reviewed_by = reviewer_user_id,
        admin_notes = notes,
        reviewed_at = NOW()
    WHERE id = request_id;

    -- Upsert role into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_request.user_id, target_request.requested_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Update profile if present
    UPDATE public.profiles
    SET role = CASE 
        WHEN target_request.requested_role = 'mentor' THEN 'faculty'
        WHEN target_request.requested_role = 'placements' THEN 'admin'
        ELSE target_request.requested_role
    END,
    updated_at = NOW()
    WHERE email = target_request.email OR id = target_request.user_id;

    RETURN TRUE;
END;
$$;
