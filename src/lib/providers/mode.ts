import type { Prisma } from 'generated/prisma/client';

type ProviderType = 'WHATSAPP_PROVIDER' | 'PAYMENT_PROVIDER';

export function getProviderMode(provider: ProviderType): 'simulated' | 'real' {
  if (process.env.APP_ENV === 'staging') return 'simulated';
  return process.env[provider] === 'real' ? 'real' : 'simulated';
}

export async function recordSimulatedOrderProviders(
  transaction: Prisma.TransactionClient,
  order: {
    restaurantId: string;
    trackingCode: string;
    paymentMethod: string;
  }
): Promise<void> {
  if (process.env.APP_ENV !== 'staging') return;

  const events = [];
  if (getProviderMode('WHATSAPP_PROVIDER') === 'simulated') {
    events.push({
      restaurantId: order.restaurantId,
      title: 'WhatsApp simulé',
      message: `Confirmation simulée enregistrée pour la commande ${order.trackingCode}. Aucun message n’a été envoyé.`,
      type: 'SIMULATED_WHATSAPP',
    });
  }
  if (getProviderMode('PAYMENT_PROVIDER') === 'simulated') {
    events.push({
      restaurantId: order.restaurantId,
      title: 'Paiement simulé',
      message: `Paiement ${order.paymentMethod} simulé pour la commande ${order.trackingCode} (en attente). Aucun débit n’a été effectué.`,
      type: 'SIMULATED_PAYMENT',
    });
  }
  if (events.length) {
    await transaction.notification.createMany({ data: events });
  }
}
