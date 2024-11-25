import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Auth sayfalarını kontrol etmiyoruz
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    
    // You can add the user info to the request headers if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user', JSON.stringify(payload));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};