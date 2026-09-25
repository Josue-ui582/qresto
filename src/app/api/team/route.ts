import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET : Récupérer les membres de l'équipe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    const whereCondition = restaurantId ? { restaurantId } : {};

    const members = await prisma.teamMember.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, members }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API GET /api/team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l’équipe.' },
      { status: 500 }
    );
  }
}

// POST : Ajouter un membre dans l'équipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, pinCode, restaurantId } = body;

    if (!name || !email || !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Le nom, l’email et l’établissement sont requis.' },
        { status: 400 }
      );
    }

    // Vérification de doublon d'email au sein du même restaurant
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        restaurantId,
        email: email.trim().toLowerCase(),
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Un membre avec cet email existe déjà dans l’établissement.' },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.create({
      data: {
        name: name.trim() || null,
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        role: role,
        pinCode: pinCode?.trim() || null,
        restaurantId,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/team:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible d’ajouter ce membre.' },
      { status: 500 }
    );
  }
}

// PUT : Mettre à jour un membre de l'équipe
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, role, pinCode, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'L’identifiant du membre est requis.' },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.trim().toLowerCase() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(role !== undefined && { role }),
        ...(pinCode !== undefined && { pinCode: pinCode?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, member: updatedMember }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API PUT /api/team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du membre.' },
      { status: 500 }
    );
  }
}

// DELETE : Retirer un membre de l'équipe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'L’identifiant du membre est requis.' },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Membre retiré avec succès.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API DELETE /api/team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du membre.' },
      { status: 500 }
    );
  }
}
