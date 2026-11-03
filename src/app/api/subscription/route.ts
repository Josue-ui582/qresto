import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleDatabaseError, parseJson } from '@/lib/api/validation';
import { authorizeRequest } from '@/lib/auth/session';
import { getPlanById, PLANS_CATALOG } from '@/lib/subscription/catalog';
import {
  activatePlanWithoutPayment,
  cancelSubscription,
  ensureTrialSubscription,
  getEffectiveSubscriptionState,
} from '@/lib/subscription/service';

const updateSubscriptionSchema = z.object({
  restaurantId: z.string().optional(),
  action: z.enum(['CHANGE_PLAN', 'CANCEL']).default('CHANGE_PLAN'),
  planId: z.enum(['STARTER', 'PRO', 'ENTERPRISE']).optional(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
}).refine((value) => value.action === 'CANCEL' || value.planId !== undefined, {
  message: 'Une formule doit être sélectionnée.',
  path: ['planId'],
});

// GET : Récupérer l'état de l'abonnement du restaurant
export async function GET(request: NextRequest) {
  const restaurantIdParam = new URL(request.url).searchParams.get('restaurantId');
  const auth = await authorizeRequest(request, 'SUBSCRIPTION_ADMIN', restaurantIdParam);
  if (auth.response) return auth.response;

  try {
    let subscription = await prisma.subscription.findUnique({
      where: { restaurantId: auth.session.restaurantId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!subscription) {
      await ensureTrialSubscription(auth.session.restaurantId);
      subscription = await prisma.subscription.findUnique({
        where: { restaurantId: auth.session.restaurantId },
        include: {
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    }
    if (!subscription) throw new Error('Impossible de créer l’abonnement d’essai.');

    const currentPlan = getPlanById(subscription.planId);
    if (!currentPlan) {
      return NextResponse.json(
        { success: false, error: 'Le plan associé à cet abonnement n’est plus disponible.' },
        { status: 500 }
      );
    }
    const effectiveStatus = getEffectiveSubscriptionState(subscription.status, subscription.endDate);
    if (effectiveStatus !== subscription.status || subscription.autoRenew) {
      subscription = await prisma.subscription.update({
        where: { restaurantId: auth.session.restaurantId },
        data: { status: effectiveStatus, autoRenew: false },
        include: {
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    }

    const [dishes, tables, members] = await Promise.all([
      prisma.dish.count({ where: { restaurantId: auth.session.restaurantId } }),
      prisma.restaurantTable.count({ where: { restaurantId: auth.session.restaurantId, active: true } }),
      prisma.teamMember.count({ where: { restaurantId: auth.session.restaurantId, active: true } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        subscription: {
          ...subscription,
          planDetails: currentPlan,
          usage: { dishes, tables, members },
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
    if (parsed.data.action === 'CANCEL') {
      const subscription = await cancelSubscription(auth.session.restaurantId);
      return NextResponse.json({
        success: true,
        message: 'Abonnement annulé. Les modifications sont désormais en lecture seule.',
        subscription,
      });
    }
    const { planId, billingCycle } = parsed.data;

    const selectedPlan = planId ? getPlanById(planId) : undefined;
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan sélectionné invalide.' },
        { status: 400 }
      );
    }

    const updatedSubscription = await activatePlanWithoutPayment(
      auth.session.restaurantId,
      selectedPlan.id,
      billingCycle
    );

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
