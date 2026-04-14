import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TEMP BYPASS: Letting all requests through for development
  return NextResponse.next();
}

export const config = {
  // Removed the protected routes so you can test freely
  matcher: [], 
};
