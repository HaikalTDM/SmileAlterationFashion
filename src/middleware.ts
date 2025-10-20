// Middleware temporarily disabled
// Using localStorage for admin authentication instead

import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Just pass through - no Edge Runtime issues
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only protect admin routes
    '/admin/dashboard/:path*',
    '/admin/orders/:path*',
  ],
};

