import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { normalizeRole, canAccessRoute, ROLE_DASHBOARDS, type AppRole } from '@/lib/rbac';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  // Static assets, api routes, icons are ignored
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  // Refresh auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isProtectedPath =
    pathname.startsWith('/student') ||
    pathname.startsWith('/mentor') ||
    pathname.startsWith('/college') ||
    pathname.startsWith('/recruiter') ||
    pathname.startsWith('/placement') ||
    pathname.startsWith('/placements') ||
    pathname.startsWith('/admin');

  // 1. Root path (/): Show login page by default for unauthenticated visitors,
  // or redirect authenticated users to their authorized dashboard
  if (pathname === '/') {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      const rawRole =
        (user.user_metadata?.role as string) ||
        (user.app_metadata?.role as string) ||
        'student';
      const normalized = normalizeRole(rawRole) || 'student';
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[normalized], request.url));
    }
  }

  // 2. If user is NOT logged in and trying to access protected route
  if (!user && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If user IS logged in
  if (user) {
    // Resolve user's role from metadata
    const rawRole =
      (user.user_metadata?.role as string) ||
      (user.app_metadata?.role as string) ||
      'student';
    const normalized = normalizeRole(rawRole) || 'student';

    // If visiting auth pages while logged in, redirect to authorized dashboard
    if (isAuthPage && pathname !== '/reset-password') {
      const dashboardUrl = new URL(ROLE_DASHBOARDS[normalized], request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Check RBAC permission for protected paths
    if (isProtectedPath) {
      const hasPermission = canAccessRoute(normalized, pathname);
      if (!hasPermission) {
        // Redirect to authorized dashboard
        const dashboardUrl = new URL(ROLE_DASHBOARDS[normalized], request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, png, svg, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
