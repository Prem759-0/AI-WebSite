import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  // If trying to access chat without token, redirect to login
  // (We'll assume the login page is the root for now or a /login route)
  if (!token && request.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/chat/:path*', '/api/ai/:path*'],
};
