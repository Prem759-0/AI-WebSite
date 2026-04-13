import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the auth token in cookies
  const token = request.cookies.get('auth-token')?.value;

  // Paths that require authentication
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/api/ai') || 
    request.nextUrl.pathname.startsWith('/api/chat');

  if (isProtectedRoute && !token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on specific API routes to save performance
export const config = {
  matcher: ['/api/ai/:path*', '/api/chat/:path*'],
};
