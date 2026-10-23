export type AppRole = 'student' | 'mentor' | 'recruiter' | 'admin' | 'placements';

export const APP_ROLES: { value: AppRole; label: string; description: string; publicSignupAllowed: boolean }[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Autonomous student access to CGPA calculator, skill passport, and proof verification',
    publicSignupAllowed: true,
  },
  {
    value: 'mentor',
    label: 'Faculty Mentor',
    description: 'Faculty mentor review desk, skill verification gate, and student mentorship',
    publicSignupAllowed: false, // Requires admin approval
  },
  {
    value: 'recruiter',
    label: 'Industry Recruiter',
    description: 'Search talent pool, filter candidates by proof tiers, and publish placement drives',
    publicSignupAllowed: false, // Requires admin approval
  },
  {
    value: 'placements',
    label: 'Placement Officer',
    description: 'Manage placement drives, eligibility criteria, student applications, and cohort stats',
    publicSignupAllowed: false, // Requires admin approval
  },
  {
    value: 'admin',
    label: 'System Administrator',
    description: 'Manage institutional accounts, role requests, and campus-wide governance',
    publicSignupAllowed: false, // Controlled server-side process only
  },
];

export const ROLE_DASHBOARDS: Record<AppRole, string> = {
  student: '/student/dashboard',
  mentor: '/mentor/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
  placements: '/placements/dashboard',
};

export const ROLE_ROUTE_PERMISSIONS: Record<AppRole, string[]> = {
  student: ['/student'],
  mentor: ['/mentor', '/college'],
  recruiter: ['/recruiter'],
  placements: ['/placements', '/placement', '/college'],
  admin: ['/admin', '/mentor', '/college', '/placement', '/placements', '/recruiter', '/student'],
};

/**
 * Normalizes legacy roles ('faculty', 'placement') and case variations to official AppRole.
 */
export function normalizeRole(rawRole: string | null | undefined): AppRole | null {
  if (!rawRole) return null;
  const clean = rawRole.toLowerCase().trim();

  if (clean === 'faculty' || clean === 'mentor') return 'mentor';
  if (clean === 'placement' || clean === 'placements') return 'placements';
  if (clean === 'recruiter') return 'recruiter';
  if (clean === 'admin') return 'admin';
  if (clean === 'student') return 'student';

  return null;
}

/**
 * Checks if a normalized role is authorized to access a given pathname.
 */
export function canAccessRoute(role: AppRole | null | undefined, pathname: string): boolean {
  if (!role) return false;

  const allowedPrefixes = ROLE_ROUTE_PERMISSIONS[role];
  if (!allowedPrefixes) return false;

  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

/**
 * Returns human-readable label for a role.
 */
export function getRoleLabel(role: AppRole | string | null | undefined): string {
  const normalized = normalizeRole(role);
  if (!normalized) return 'User';
  switch (normalized) {
    case 'student':
      return 'Student';
    case 'mentor':
      return 'Faculty Mentor';
    case 'recruiter':
      return 'Industry Recruiter';
    case 'placements':
      return 'Placement Officer';
    case 'admin':
      return 'System Administrator';
  }
}
