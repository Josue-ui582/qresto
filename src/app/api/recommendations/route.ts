import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../lib/storage';
import { z } from 'zod';

const moodSchema = z.string().trim().min(1).max(40);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedMood = moodSchema.safeParse(searchParams.get('mood') ?? 'discovery');
    if (!parsedMood.success) {
      return NextResponse.json({ success: false, error: 'Humeur invalide.' }, { status: 400 });
    }
    const mood = parsedMood.data;

    const allDishes = storage.getDishes();
    const specialties = allDishes.filter((d) => d.isSpecialty);
    const drinks = allDishes.filter((d) => d.categoryId === 'cat_drinks');

    const recommendations = [
      {
        title: 'Formule Découverte Bénin Gourmand',
        description: 'Pour s’immerger dans l’authenticité des saveurs locales',
        mainDish: specialties[0] || allDishes[0],
        drink: drinks[0] || allDishes[allDishes.length - 1],
        totalPrice: 5300,
        currency: 'FCFA',
        badge: 'Coup de Cœur Chef',
      },
      {
        title: 'Festin Soirée Grillades & Chill',
        description: 'Idéal entre amis avec notre poulet braisé mariné 24h',
        mainDish: allDishes.find((d) => d.name.toLowerCase().includes('poulet')) || allDishes[1],
        drink: drinks[1] || drinks[0],
        totalPrice: 6000,
        currency: 'FCFA',
        badge: 'Populaire',
      },
      {
        title: 'Pause Déjeuner Express & Équilibrée',
        description: 'Servi en moins de 15 minutes, riche et savoureux',
        mainDish: allDishes.find((d) => d.name.toLowerCase().includes('wagashi')) || allDishes[2],
        drink: drinks[0],
        totalPrice: 4200,
        currency: 'FCFA',
        badge: 'Rapide à table',
      },
    ];

    return NextResponse.json({
      success: true,
      mood,
      data: recommendations,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}
