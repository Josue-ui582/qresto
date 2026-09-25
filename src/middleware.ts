import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Si vous utilisez Jose ou JWT pour décoder vos tokens sur l'Edge :
import { jwtVerify } from 'jose'; 

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'votre-cle-secrete-par-defaut'
);

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
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // 3. Vérification du rôle RESTAURANT_OWNER
    if (payload.role !== 'RESTAURANT_OWNER') {
      // Si l'utilisateur n'est pas un propriétaire, accès refusé
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Token invalide ou expiré -> Redirection vers /login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// 4. Configuration des routes ciblées par le middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};
