import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedRoutes = ['/dashboard', '/discover', '/search-intent', '/connections', '/messages', '/feed', '/profile', '/upload', '/settings', '/onboarding'];
const authRoutes = ['/login', '/signup'];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('cc_token')?.value;
  const { pathname } = req.nextUrl;

  let isAuthenticated = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {}
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
