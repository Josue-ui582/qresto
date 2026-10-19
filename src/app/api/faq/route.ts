import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError } from '@/lib/api/validation';

export async function GET() {
  try {
    const faqItems = await prisma.fAQItem.findMany({
      where: { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
      },
    });

    return NextResponse.json({ faqItems });
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du chargement de la FAQ.');
  }
}
