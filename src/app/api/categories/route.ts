import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson, parseQueryParam } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';

const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  restaurantId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const categoryUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'MENU_READ', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    const categories = await prisma.category.findMany({
      where: { restaurantId: auth.session.restaurantId },
      include: { _count: { select: { dishes: true } } },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération des catégories.');
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, categoryCreateSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'MENU_WRITE', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        restaurantId: auth.session.restaurantId,
        order: parsed.data.sortOrder ?? 0,
      },
      include: { _count: { select: { dishes: true } } },
    });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de créer la catégorie.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, categoryUpdateSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'MENU_WRITE');

  if (auth.response) return auth.response;
  try {
    const { id, name, description, sortOrder } = parsed.data;
    const updated = await prisma.category.updateMany({
      where: { id, restaurantId: auth.session.restaurantId },
      data: {
        name,
        description: description || null,
        ...(sortOrder !== undefined && { order: sortOrder }),
      },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
    }
    const category = await prisma.category.findFirst({
      where: { id, restaurantId: auth.session.restaurantId },
      include: { _count: { select: { dishes: true } } },
    });
    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la mise à jour de la catégorie.');
  }
}

export async function DELETE(request: NextRequest) {
  const parsedId = parseQueryParam(new URL(request.url).searchParams.get('id'), 'Identifiant de catégorie');
  if (!parsedId.success) return parsedId.response;
  if (!parsedId.data) {
    return NextResponse.json({ error: 'Identifiant de catégorie requis.' }, { status: 400 });
  }
  const id = parsedId.data;
  const auth = await authorizeRequest(request, 'MENU_WRITE');
  if (auth.response) return auth.response;

  try {
    const category = await prisma.category.findFirst({
      where: { id, restaurantId: auth.session.restaurantId },
      select: { id: true, _count: { select: { dishes: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
    }
    if (category._count.dishes > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer : ${category._count.dishes} plat(s) sont encore associés à cette catégorie.`,
        },
        { status: 400 }
      );
    }
    await prisma.category.deleteMany({
      where: { id, restaurantId: auth.session.restaurantId },
    });
    return NextResponse.json({ success: true, message: 'Catégorie supprimée.' }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la suppression de la catégorie.');
  }
}
