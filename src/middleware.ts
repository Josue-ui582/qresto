import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret, JwtConfigurationError } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // 1. Redirection si aucun token n'est présent
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Vérification et décodage du JWT (compatible Edge Runtime)
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (payload.role !== 'RESTAURANT_OWNER' && payload.role !== 'RESTAURANT_STAFF') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    if (error instanceof JwtConfigurationError) {
      return NextResponse.json(
        { error: 'Configuration d’authentification indisponible.' },
        { status: 500 }
      );
    }
    // Token invalide ou expiré -> Redirection vers /login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// 4. Configuration des routes ciblées par le middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};
