import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';
import { getPlanById, PLANS_CATALOG } from '@/lib/subscription/catalog';

const updateSubscriptionSchema = z.object({
  restaurantId: z.string().optional(),
  planId: z.enum(['STARTER', 'PRO', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
});

// GET : Récupérer l'état de l'abonnement du restaurant
export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'SUBSCRIPTION_ADMIN', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    // Récupération de l'abonnement
    let subscription = await prisma.subscription.findUnique({
      where: { restaurantId: auth.session.restaurantId },
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
          restaurantId: auth.session.restaurantId,
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

    const currentPlan = getPlanById(subscription.planId);
    if (!currentPlan) {
      return NextResponse.json(
        { success: false, error: 'Le plan associé à cet abonnement n’est plus disponible.' },
        { status: 500 }
      );
    }

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
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors de la récupération de l’abonnement.');
  }
}

// POST / PUT : Demander un changement de plan ou renouvellement
export async function POST(request: NextRequest) {
  const parsed = await parseJson(request, updateSubscriptionSchema);
  if (!parsed.success) return parsed.response;
  const auth = await authorizeRequest(request, 'SUBSCRIPTION_ADMIN', parsed.data.restaurantId);
  if (auth.response) return auth.response;

  try {
    const { planId, billingCycle } = parsed.data;

    const selectedPlan = getPlanById(planId);
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

    // Mise à jour ou création de l'abonnement
    const updatedSubscription = await prisma.subscription.upsert({
      where: { restaurantId: auth.session.restaurantId },
      update: {
        planId,
        billingCycle,
        status: 'ACTIVE',
        startDate: now,
        endDate: nextEndDate,
        autoRenew: false,
      },
      create: {
        restaurantId: auth.session.restaurantId,
        planId,
        billingCycle,
        status: 'ACTIVE',
        startDate: now,
        endDate: nextEndDate,
        autoRenew: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Formule activée sans paiement. Le paiement en ligne sera intégré ultérieurement.',
        subscription: updatedSubscription,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleDatabaseError(error, 'Erreur lors du changement d’abonnement.');
  }
}
