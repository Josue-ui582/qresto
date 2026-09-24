import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../lib/storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const cuisine = searchParams.get('cuisine');

    let list = storage.getRestaurants();

    if (city && city !== 'all') {
      list = list.filter((r) => r.city.toLowerCase() === city.toLowerCase());
    }

    if (cuisine && cuisine !== 'all') {
      list = list.filter((r) =>
        r.cuisineType.toLowerCase().includes(cuisine.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: list,
      total: list.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
