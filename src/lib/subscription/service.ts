import { Prisma } from 'generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getPlanById, type PlanId, type PlanLimit } from './catalog';
import type { PlanResource } from './policy';
import { canModifyWithSubscriptionState, getEffectiveSubscriptionState } from './policy';

export { createPlanLimitMessage, isResourceLimitReached } from './policy';
export { canModifyWithSubscriptionState, getEffectiveSubscriptionState } from './policy';

export async function getPlanResourceUsage(
  client: Prisma.TransactionClient | typeof prisma,
  restaurantId: string,
  resource: PlanResource
): Promise<{ limit: PlanLimit; usage: number; planName: string }> {
  const subscription = await client.subscription.findUnique({
    where: { restaurantId },
    select: { planId: true },
  });
  if (!subscription) {
    throw new Error('Aucun abonnement n’est associé à ce restaurant.');
  }
  const plan = getPlanById(subscription.planId);
  if (!plan) {
    throw new Error(`Plan d’abonnement inconnu : ${subscription.planId}`);
  }

  const usage = resource === 'dishes'
    ? await client.dish.count({ where: { restaurantId } })
    : resource === 'tables'
      ? await client.restaurantTable.count({ where: { restaurantId, active: true } })
      : await client.teamMember.count({ where: { restaurantId, active: true } });
  return { limit: plan.limits[resource], usage, planName: plan.name };
}

export async function ensureTrialSubscription(restaurantId: string) {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 14);

  return prisma.subscription.upsert({
    where: { restaurantId },
    update: {},
    create: {
      restaurantId,
      planId: 'PRO',
      status: 'TRIAL',
      billingCycle: 'MONTHLY',
      startDate: now,
      endDate,
      autoRenew: false,
    },
  });
}

export async function enforceSubscriptionWriteAccess(restaurantId: string) {
  const existingSubscription = await prisma.subscription.findUnique({
    where: { restaurantId },
    select: { status: true, endDate: true },
  });
  const subscription = existingSubscription ?? await ensureTrialSubscription(restaurantId);

  const effectiveStatus = getEffectiveSubscriptionState(
    subscription.status,
    subscription.endDate
  );
  if (effectiveStatus !== subscription.status) {
    await prisma.subscription.update({
      where: { restaurantId },
      data: { status: effectiveStatus },
    });
  }

  return {
    allowed: canModifyWithSubscriptionState(effectiveStatus),
    status: effectiveStatus,
  };
}

export async function activatePlanWithoutPayment(
  restaurantId: string,
  planId: PlanId,
  billingCycle: 'MONTHLY' | 'YEARLY'
) {
  const now = new Date();
  const endDate = new Date(now);
  if (billingCycle === 'YEARLY') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  return prisma.subscription.upsert({
    where: { restaurantId },
    update: {
      planId,
      billingCycle,
      status: 'ACTIVE',
      startDate: now,
      endDate,
      autoRenew: false,
    },
    create: {
      restaurantId,
      planId,
      billingCycle,
      status: 'ACTIVE',
      startDate: now,
      endDate,
      autoRenew: false,
    },
  });
}

export async function cancelSubscription(restaurantId: string) {
  return prisma.subscription.update({
    where: { restaurantId },
    data: {
      status: 'CANCELLED',
      endDate: new Date(),
      autoRenew: false,
    },
  });
}
