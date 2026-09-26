import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dishesSlugify } from '@/utils';

// GET : Récupérer tous les plats (filtrable par restaurantId et categoryId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const categoryId = searchParams.get('categoryId');

    const whereCondition: any = {};
    if (restaurantId) whereCondition.restaurantId = restaurantId;
    if (categoryId) whereCondition.categoryId = categoryId;

    const dishes = await prisma.dish.findMany({
      where: whereCondition,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, dishes }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des plats.' },
      { status: 500 }
    );
  }
}

// POST : Créer un nouveau plat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, image, isAvailable, categoryId, restaurantId } = body;

    const dishImage = imageUrl || image;

    // Validation stricte incluant l'image
    if (!name || price === undefined || !categoryId || !restaurantId || !dishImage) {
      return NextResponse.json(
        { success: false, error: 'Le nom, le prix, la catégorie, le restaurant et l\'image sont requis.' },
        { status: 400 }
      );
    }

    const baseSlug = dishesSlugify(name);
    const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const dish = await prisma.dish.create({
      data: {
        name: name.trim(),
        slug: uniqueSlug,
        description: description?.trim() || null,
        price: Math.round(Number(price)),
        image: dishImage.trim(),
        isAvailable: isAvailable ?? true,
        categoryId,
        restaurantId,
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, dish }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de créer le plat.' },
      { status: 500 }
    );
  }
}

// PUT / PATCH : Mettre à jour un plat
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, imageUrl, image, isAvailable, categoryId } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant du plat est requis." },
        { status: 400 }
      );
    }

    const dishImage = imageUrl !== undefined ? imageUrl : image;

    const updatedDish = await prisma.dish.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: Math.round(Number(price)) }),
        ...(dishImage !== undefined && { image: dishImage?.trim() || null }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, dish: updatedDish }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API PUT /api/dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du plat.' },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer un plat
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant du plat est requis." },
        { status: 400 }
      );
    }

    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Plat supprimé avec succès.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API DELETE /api/dishes:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du plat.' },
      { status: 500 }
    );
  }
}
