export interface CreatedOrderNotification {
  id: string;
  trackingCode: string;
  restaurantId: string;
}

export interface OrderNotifier {
  notifyOrderCreated(order: CreatedOrderNotification): Promise<void>;
}

class LoggingOrderNotifier implements OrderNotifier {
  async notifyOrderCreated(order: CreatedOrderNotification): Promise<void> {
    console.info('Nouvelle commande enregistrée.', {
      orderId: order.id,
      trackingCode: order.trackingCode,
      restaurantId: order.restaurantId,
    });
  }
}

const orderNotifier: OrderNotifier = new LoggingOrderNotifier();

export function notifyOrderCreated(order: CreatedOrderNotification): Promise<void> {
  return orderNotifier.notifyOrderCreated(order);
}
