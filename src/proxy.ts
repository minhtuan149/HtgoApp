import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Validate the session token
  let user = null;
  if (token) {
    user = await verifyJWT(token);
  }

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isApiProtectedPage = pathname.startsWith('/api/transactions') || pathname.startsWith('/api/categories');

  // Dashboard page protection
  if (isDashboardPage) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API protection
  if (isApiProtectedPage) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Login/Register page protection
  if (isAuthPage) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Root path routing
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
