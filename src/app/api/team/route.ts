import { NextRequest, NextResponse } from 'next/server';
import { StaffRole } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson, parseQueryParam } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';
import { createPlanLimitMessage, getPlanResourceUsage, isResourceLimitReached } from '@/lib/subscription/service';

const staffRoleSchema = z.nativeEnum(StaffRole);

const createMemberSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional(),
  role: staffRoleSchema.optional(),
  pinCode: z.string().regex(/^\d{4}$/).optional().or(z.literal('')),
  restaurantId: z.string().optional(),
});

const updateMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(150).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  role: staffRoleSchema.optional(),
  pinCode: z.string().regex(/^\d{4}$/).nullable().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'TEAM_ADMIN', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    const members = await prisma.teamMember.findMany({
      where: { restaurantId: auth.session.restaurantId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      success: true,
      members: members.map(({ active, ...member }) => ({ ...member, isActive: active })),
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération de l’équipe.');
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, createMemberSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'TEAM_ADMIN', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const planLimit = await getPlanResourceUsage(tx, auth.session.restaurantId, 'members');
      const limit = planLimit.limit;
      if (isResourceLimitReached(limit, planLimit.usage)) {
        return { limitReached: { limit, planName: planLimit.planName } };
      }

      const member = await tx.teamMember.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase(),
          phone: parsed.data.phone || null,
          role: parsed.data.role || StaffRole.WAITER,
          pinCode: parsed.data.pinCode || null,
          restaurantId: auth.session.restaurantId,
        },
      });
      return { member };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if ('limitReached' in result && result.limitReached) {
      const { limit, planName } = result.limitReached;
      return NextResponse.json(
        { error: createPlanLimitMessage(planName, 'members', limit) },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, member: result.member }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible d’ajouter ce membre.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateMemberSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'TEAM_ADMIN');
  if (auth.response) return auth.response;

  try {
    const { id, isActive, ...fields } = parsed.data;
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.teamMember.findFirst({
        where: { id, restaurantId: auth.session.restaurantId },
        select: { active: true },
      });
      if (!existing) return { missing: true as const };

      if (isActive === true && !existing.active) {
        const planLimit = await getPlanResourceUsage(tx, auth.session.restaurantId, 'members');
        const limit = planLimit.limit;
        if (isResourceLimitReached(limit, planLimit.usage)) {
          return { limitReached: { limit, planName: planLimit.planName } };
        }
      }

      await tx.teamMember.updateMany({
        where: { id, restaurantId: auth.session.restaurantId },
        data: {
          ...fields,
          ...(isActive !== undefined && { active: isActive }),
          ...(fields.email && { email: fields.email.toLowerCase() }),
          ...(fields.phone !== undefined && { phone: fields.phone || null }),
          ...(fields.pinCode !== undefined && { pinCode: fields.pinCode || null }),
        },
      });
      return {
        member: await tx.teamMember.findFirst({
          where: { id, restaurantId: auth.session.restaurantId },
        }),
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if ('missing' in result) {
      return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    }
    if ('limitReached' in result && result.limitReached) {
      const { limit, planName } = result.limitReached;
      return NextResponse.json(
        { error: createPlanLimitMessage(planName, 'members', limit) },
        { status: 403 }
      );
    }
    const member = result.member;
    return NextResponse.json({
      success: true,
      member: member && { ...member, isActive: member.active },
    });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la mise à jour du membre.');
  }
}

export async function DELETE(request: NextRequest) {
  const parsedId = parseQueryParam(new URL(request.url).searchParams.get('id'), 'Identifiant du membre');
  if (!parsedId.success) return parsedId.response;
  if (!parsedId.data) {
    return NextResponse.json({ error: 'Identifiant du membre requis.' }, { status: 400 });
  }
  const id = parsedId.data;
  const auth = await authorizeRequest(request, 'TEAM_ADMIN');
  if (auth.response) return auth.response;

  try {
    const deleted = await prisma.teamMember.deleteMany({
      where: { id, restaurantId: auth.session.restaurantId },
    });
    if (!deleted.count) {
      return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Membre retiré avec succès.' });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la suppression du membre.');
  }
}
