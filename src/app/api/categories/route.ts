import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET : Récupérer toutes les catégories (optionnellement filtrées par restaurantId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    const whereCondition = restaurantId ? { restaurantId } : {};

    const categories = await prisma.category.findMany({
      where: whereCondition,
      include: {
        _count: {
          select: { dishes: true },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des catégories.' },
      { status: 500 }
    );
  }
}

// POST : Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, restaurantId, sortOrder } = body;

    if (!name || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le restaurant sont obligatoires.' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        restaurantId,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de créer la catégorie.' },
      { status: 500 }
    );
  }
}

// PUT / PATCH : Mettre à jour une catégorie
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, sortOrder } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: "L'ID et le nom sont requis." },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : undefined,
      },
      include: {
        _count: {
          select: { dishes: true },
        },
      },
    });

    return NextResponse.json({ success: true, category: updatedCategory }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API PUT /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour.' },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer une catégorie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de la catégorie est requis." },
        { status: 400 }
      );
    }

    // Optionnel : vérification si la catégorie contient des plats
    const countDishes = await prisma.dish.count({ where: { categoryId: id } });
    if (countDishes > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Impossible de supprimer : ${countDishes} plat(s) sont encore associés à cette catégorie.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Catégorie supprimée avec succès.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API DELETE /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la catégorie.' },
      { status: 500 }
    );
  }
}
