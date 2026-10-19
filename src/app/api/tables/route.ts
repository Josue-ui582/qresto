import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson, parseQueryParam } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';

const createTableSchema = z.object({
  number: z.union([z.string().trim().min(1).max(30), z.number().int().positive()]),
  capacity: z.number().int().positive().max(100).optional(),
  name: z.string().trim().max(100).optional(),
  restaurantId: z.string().optional(),
});

const updateTableSchema = z.object({
  id: z.string().min(1),
  number: z.union([z.string().trim().min(1).max(30), z.number().int().positive()]).optional(),
  capacity: z.number().int().positive().max(100).optional(),
  name: z.string().trim().max(100).nullable().optional(),
});

export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'TABLES_READ', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    const tables = await prisma.restaurantTable.findMany({
      where: { restaurantId: auth.session.restaurantId },
      include: { restaurant: { select: { id: true, name: true, slug: true } } },
      orderBy: { number: 'asc' },
    });
    return NextResponse.json({ success: true, tables }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération des tables.');
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, createTableSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'TABLES_WRITE', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const number = String(parsed.data.number).trim();
    const existing = await prisma.restaurantTable.findFirst({
      where: { restaurantId: auth.session.restaurantId, number },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: `La table #${number} existe déjà.` }, { status: 409 });
    }
    const table = await prisma.restaurantTable.create({
      data: {
        number,
        capacity: parsed.data.capacity ?? 4,
        name: parsed.data.name || null,
        restaurantId: auth.session.restaurantId,
      },
      include: { restaurant: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de créer la table.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateTableSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'TABLES_WRITE');
  if (auth.response) return auth.response;

  try {
    const { id, number, ...fields } = parsed.data;
    const result = await prisma.restaurantTable.updateMany({
      where: { id, restaurantId: auth.session.restaurantId },
      data: {
        ...fields,
        ...(number !== undefined && { number: String(number).trim() }),
      },
    });
    if (!result.count) {
      return NextResponse.json({ error: 'Table introuvable.' }, { status: 404 });
    }
    const table = await prisma.restaurantTable.findFirst({
      where: { id, restaurantId: auth.session.restaurantId },
      include: { restaurant: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ success: true, table }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la mise à jour de la table.');
  }
}

export async function DELETE(request: NextRequest) {
  const parsedId = parseQueryParam(new URL(request.url).searchParams.get('id'), 'Identifiant de table');
  if (!parsedId.success) return parsedId.response;
  if (!parsedId.data) {
    return NextResponse.json({ error: 'Identifiant de table requis.' }, { status: 400 });
  }
  const id = parsedId.data;
  const auth = await authorizeRequest(request, 'TABLES_WRITE');
  if (auth.response) return auth.response;

  try {
    const deleted = await prisma.restaurantTable.deleteMany({
      where: { id, restaurantId: auth.session.restaurantId },
    });
    if (!deleted.count) {
      return NextResponse.json({ error: 'Table introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Table supprimée avec succès.' });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la suppression de la table.');
  }
}
