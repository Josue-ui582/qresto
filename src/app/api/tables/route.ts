import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET : Récupérer toutes les tables (filtrables par restaurantId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    const whereCondition = restaurantId ? { restaurantId } : {};

    const tables = await prisma.restaurantTable.findMany({
      where: whereCondition,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json({ success: true, tables }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/tables:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tables.' },
      { status: 500 }
    );
  }
}

// POST : Créer une nouvelle table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity, name, restaurantId } = body;

    if (!number || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Le numéro de table et le restaurant sont requis.' },
        { status: 400 }
      );
    }

    // Vérifier si le numéro de table existe déjà pour ce restaurant
    const existingTable = await prisma.restaurantTable.findFirst({
      where: {
        restaurantId,
        number: parseInt(number, 10),
      },
    });

    if (existingTable) {
      return NextResponse.json(
        { success: false, error: `La table #${number} existe déjà dans cet établissement.` },
        { status: 400 }
      );
    }

    const table = await prisma.restaurantTable.create({
      data: {
        number: parseInt(number, 10),
        capacity: capacity ? parseInt(capacity, 10) : 4,
        name: name?.trim() || null,
        restaurantId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/tables:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de créer la table.' },
      { status: 500 }
    );
  }
}

// PUT : Mettre à jour une table
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, number, capacity, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de la table est requis." },
        { status: 400 }
      );
    }

    const updatedTable = await prisma.restaurantTable.update({
      where: { id },
      data: {
        ...(number !== undefined && { number: parseInt(number, 10) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity, 10) }),
        ...(name !== undefined && { name: name?.trim() || null }),
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, table: updatedTable }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API PUT /api/tables:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la table.' },
      { status: 500 }
    );
  }
}

// DELETE : Supprimer une table
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "L'identifiant de la table est requis." },
        { status: 400 }
      );
    }

    await prisma.restaurantTable.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Table supprimée avec succès.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API DELETE /api/tables:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la table.' },
      { status: 500 }
    );
  }
}
