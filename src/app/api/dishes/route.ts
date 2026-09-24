import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const category = searchParams.get('category');
    const isSpecialty = searchParams.get('isSpecialty');

    let dishes = storage.getDishes(restaurantId || undefined);

    if (category && category !== 'all') {
      dishes = dishes.filter((d) => d.categoryId === category);
    }

    if (isSpecialty === 'true') {
      dishes = dishes.filter((d) => d.isSpecialty);
    }

    return NextResponse.json({
      success: true,
      data: dishes,
      total: dishes.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
