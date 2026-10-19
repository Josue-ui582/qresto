import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from 'generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson, parseQueryParam } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';
import { dishesSlugify } from '@/utils';

const createDishSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
  price: z.number().finite().min(0).max(100_000_000),
  imageUrl: z.string().trim().min(1).max(2048).optional(),
  image: z.string().trim().min(1).max(2048).optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1),
  restaurantId: z.string().optional(),
}).refine((value) => value.imageUrl || value.image, {
  message: 'Une image est requise.',
  path: ['imageUrl'],
});

const updateDishSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  price: z.number().finite().min(0).max(100_000_000).optional(),
  imageUrl: z.string().trim().max(2048).nullable().optional(),
  image: z.string().trim().max(2048).nullable().optional(),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = new URL(request.url).searchParams;
  const restaurantIdParam = searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'MENU_READ', restaurantIdParam);
  if (auth.response) return auth.response;

  const parsedCategoryId = parseQueryParam(searchParams.get('categoryId'), 'Identifiant de catégorie');
  if (!parsedCategoryId.success) return parsedCategoryId.response;
  const categoryId = parsedCategoryId.data;
  const where: Prisma.DishWhereInput = {
    restaurantId: auth.session.restaurantId,
    ...(categoryId ? { categoryId } : {}),
  };

  try {
    const dishes = await prisma.dish.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, dishes }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération des plats.');
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, createDishSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'MENU_WRITE', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, restaurantId: auth.session.restaurantId },
      select: { id: true },
    });
    if (!category) {
      return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
    }

    const baseSlug = dishesSlugify(parsed.data.name);
    const dish = await prisma.dish.create({
      data: {
        name: parsed.data.name,
        slug: `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`,
        description: parsed.data.description || null,
        price: Math.round(parsed.data.price),
        image: parsed.data.imageUrl || parsed.data.image || null,
        isAvailable: parsed.data.isAvailable ?? true,
        categoryId: category.id,
        restaurantId: auth.session.restaurantId,
      },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ success: true, dish }, { status: 201 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Impossible de créer le plat.');
  }
}

export async function PUT(request: NextRequest) {
  const parsed = await parseJson(request, updateDishSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'MENU_WRITE');
  if (auth.response) return auth.response;

  try {
    const { id, categoryId, imageUrl, image, ...fields } = parsed.data;
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, restaurantId: auth.session.restaurantId },
        select: { id: true },
      });
      if (!category) {
        return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
      }
    }
    const result = await prisma.dish.updateMany({
      where: { id, restaurantId: auth.session.restaurantId },
      data: {
        ...fields,
        ...(categoryId && { categoryId }),
        ...((imageUrl !== undefined || image !== undefined) && {
          image: imageUrl ?? image ?? null,
        }),
      },
    });
    if (!result.count) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 });
    }
    const dish = await prisma.dish.findFirst({
      where: { id, restaurantId: auth.session.restaurantId },
      include: { category: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ success: true, dish }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la mise à jour du plat.');
  }
}

export async function DELETE(request: NextRequest) {
  const parsedId = parseQueryParam(new URL(request.url).searchParams.get('id'), 'Identifiant de plat');
  if (!parsedId.success) return parsedId.response;
  if (!parsedId.data) {
    return NextResponse.json({ error: 'Identifiant de plat requis.' }, { status: 400 });
  }
  const id = parsedId.data;
  const auth = await authorizeRequest(request, 'MENU_WRITE');
  if (auth.response) return auth.response;

  try {
    const deleted = await prisma.dish.deleteMany({
      where: { id, restaurantId: auth.session.restaurantId },
    });
    if (!deleted.count) {
      return NextResponse.json({ error: 'Plat introuvable.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Plat supprimé.' }, { status: 200 });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la suppression du plat.');
  }
}
