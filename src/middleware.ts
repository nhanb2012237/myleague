import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('__token__');

  const url = request.nextUrl.clone(); // tạo một bản sao của url hiện tại
  const publicRoutes = ['/auth/sign-up', '/auth/sign-in', '/forgot-password'];
  const protectedRoutes = ['/admin', '/tournament'];

  if (token) {
    if (publicRoutes.includes(url.pathname)) {
      return NextResponse.redirect(new URL('/tournament', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    if (protectedRoutes.some((route) => url.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|user|_next/static|_next/image|favicon.ico).*)'],
};
