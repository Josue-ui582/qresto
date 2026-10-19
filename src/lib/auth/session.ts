import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { UserRole } from 'generated/prisma/enums';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getJwtSecret, JwtConfigurationError } from './jwt';
import { roleHasPermission, type ApiPermission } from './permissions';

async function fetchSessionUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      restaurantId: true,
      ownedRestaurant: { select: { id: true } },
      teamMemberships: {
        where: { active: true },
        select: { restaurantId: true, role: true },
      },
    },
  });
}

export interface ApiSession {
  userId: string;
  role: UserRole;
  restaurantId: string;
  staffRole: 'MANAGER' | 'CHEF' | 'WAITER' | 'CASHIER' | 'DELIVERY' | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
  };
}

export type SessionResult =
  | { session: ApiSession; response?: never }
  | { session?: never; response: NextResponse };

export async function authorizeRequest(
  request: NextRequest,
  permission: ApiPermission | null,
  requestedRestaurantId?: string | null
): Promise<SessionResult> {
  let scopedRestaurantId = requestedRestaurantId;
  if (requestedRestaurantId !== undefined && requestedRestaurantId !== null) {
    const parsedRestaurantId = z.string().trim().min(1).max(100).safeParse(requestedRestaurantId);
    if (!parsedRestaurantId.success) {
      return {
        response: NextResponse.json(
          { error: 'Identifiant de restaurant invalide.' },
          { status: 400 }
        ),
      };
    }
    scopedRestaurantId = parsedRestaurantId.data;
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return { response: NextResponse.json({ error: 'Non authentifié.' }, { status: 401 }) };
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.userId !== 'string') {
      return { response: NextResponse.json({ error: 'Session invalide.' }, { status: 401 }) };
    }
    userId = payload.userId;
  } catch (error: unknown) {
    if (error instanceof JwtConfigurationError) {
      console.error(error.message);
      return {
        response: NextResponse.json(
          { error: 'Configuration d’authentification indisponible.' },
          { status: 500 }
        ),
      };
    }
    return { response: NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 }) };
  }

  let user: Awaited<ReturnType<typeof fetchSessionUser>>;
  try {
    user = await fetchSessionUser(userId);
  } catch (error: unknown) {
    console.error('Erreur lors de la validation de la session API:', error);
    return {
      response: NextResponse.json(
        { error: 'Erreur lors de la validation de la session.' },
        { status: 500 }
      ),
    };
  }

  if (!user) {
    return { response: NextResponse.json({ error: 'Session invalide.' }, { status: 401 }) };
  }

  const ownedRestaurantId = user.ownedRestaurant?.id;
  const restaurantId = user.role === 'RESTAURANT_OWNER'
    ? ownedRestaurantId
    : user.restaurantId;
  if (!restaurantId) {
    return {
      response: NextResponse.json(
        { error: 'Aucun établissement actif n’est associé à ce compte.' },
        { status: 403 }
      ),
    };
  }

  const membership = user.teamMemberships.find(
    (teamMember) => teamMember.restaurantId === restaurantId
  );
  const staffRole = user.role === 'RESTAURANT_STAFF' ? membership?.role || null : null;
  if (
    user.role === 'RESTAURANT_STAFF' &&
    (!membership || !user.restaurantId || membership.restaurantId !== user.restaurantId)
  ) {
    return {
      response: NextResponse.json(
        { error: 'Aucun accès d’équipe actif n’est associé à ce compte.' },
        { status: 403 }
      ),
    };
  }

  if (scopedRestaurantId && scopedRestaurantId !== restaurantId) {
    return {
      response: NextResponse.json(
        { error: 'Accès interdit à cet établissement.' },
        { status: 403 }
      ),
    };
  }

  if (permission && !roleHasPermission(user.role, staffRole, permission)) {
    return {
      response: NextResponse.json(
        { error: 'Votre rôle ne permet pas cette opération.' },
        { status: 403 }
      ),
    };
  }

  return {
    session: {
      userId: user.id,
      role: user.role,
      restaurantId,
      staffRole,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    },
  };
}
