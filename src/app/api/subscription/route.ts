import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Constantes des plans tarifaires
export const PLANS_CATALOG = [
  {
    id: 'STARTER',
    name: 'Starter / Découverte',
    description: 'Idéal pour les petits établissements ou pour tester le menu QR.',
    monthlyPrice: 15000,
    yearlyPrice: 144000, // 12 000 FCFA / mois
    maxTables: 10,
    features: [
      'Jusqu’à 10 tables',
      'Menu numérique dynamique HD',
      'Génération de QR Codes standards',
      'Support par e-mail',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro / Restaurant',
    popular: true,
    description: 'La solution complète pour optimiser le service et booster les ventes.',
    monthlyPrice: 35000,
    yearlyPrice: 336000, // 28 000 FCFA / mois
    maxTables: 999, // Illimité
    features: [
      'Tables illimitées',
      'Signalétique QR HD & Personnalisée',
      'Suivi des commandes en temps réel',
      'Tableau de bord Analytics avancé',
      'Gestion des rôles de l’équipe',
      'Support prioritaire WhatsApp 7j/7',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise / Multi-Sites',
    description: 'Pour les chaînes de restaurants, hôtels et complexes VIP.',
    monthlyPrice: 75000,
    yearlyPrice: 720000, // 60 000 FCFA / mois
    maxTables: 9999,
    features: [
      'Multi-établissements intégrés',
      'Tout du Plan Pro inclus',
      'Intégration API & Caisses POS',
      'Accompagnement & Setup sur site',
      'Account Manager dédié',
      'SLA Garanti 99.9%',
    ],
  },
];

// GET : Récupérer l'état de l'abonnement du restaurant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du restaurant requis.' },
        { status: 400 }
      );
    }

    // Récupération de l'abonnement
    let subscription = await prisma.subscription.findUnique({
      where: { restaurantId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Si aucun abonnement en BDD, créer un plan Découverte / Essai par défaut
    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(now.getDate() + 14); // 14 jours d'essai

      subscription = await prisma.subscription.create({
        data: {
          restaurantId,
          planId: 'PRO',
          status: 'TRIAL',
          billingCycle: 'MONTHLY',
          startDate: now,
          endDate: trialEnd,
          autoRenew: true,
        },
        include: {
          invoices: true,
        },
      });
    }

    const currentPlan = PLANS_CATALOG.find((p) => p.id === subscription?.planId) || PLANS_CATALOG[0];

    return NextResponse.json(
      {
        success: true,
        subscription: {
          ...subscription,
          planDetails: currentPlan,
        },
        availablePlans: PLANS_CATALOG,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API GET /api/subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l’abonnement.' },
      { status: 500 }
    );
  }
}

// POST / PUT : Demander un changement de plan ou renouvellement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, planId, billingCycle } = body;

    if (!restaurantId || !planId) {
      return NextResponse.json(
        { success: false, error: 'Les paramètres restaurantId et planId sont requis.' },
        { status: 400 }
      );
    }

    const selectedPlan = PLANS_CATALOG.find((p) => p.id === planId);
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan sélectionné invalide.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const nextEndDate = new Date();
    if (billingCycle === 'YEARLY') {
      nextEndDate.setFullYear(now.getFullYear() + 1);
    } else {
      nextEndDate.setMonth(now.getMonth() + 1);
    }

    const price =
      billingCycle === 'YEARLY' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;

    // Mise à jour ou création de l'abonnement
    const updatedSubscription = await prisma.subscription.upsert({
      where: { restaurantId },
      update: {
        planId,
        billingCycle: billingCycle || 'MONTHLY',
        status: 'ACTIVE',
        startDate: now,
        endDate: nextEndDate,
        autoRenew: true,
      },
      create: {
        restaurantId,
        planId,
        billingCycle: billingCycle || 'MONTHLY',
        status: 'ACTIVE',
        startDate: now,
        endDate: nextEndDate,
        autoRenew: true,
      },
    });

    // Générer une facture correspondante
    await prisma.invoice.create({
      data: {
        subscriptionId: updatedSubscription.id,
        amount: price,
        currency: 'FCFA',
        status: 'PAID',
        description: `Abonnement ${selectedPlan.name} (${billingCycle === 'YEARLY' ? 'Annuel' : 'Mensuel'})`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Abonnement mis à jour avec succès.',
        subscription: updatedSubscription,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur API POST /api/subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du changement d’abonnement.' },
      { status: 500 }
    );
  }
}
