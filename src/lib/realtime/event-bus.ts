export type RealtimeEvent =
  | { type: 'order.created'; trackingCode: string }
  | { type: 'order.updated'; trackingCode: string }
  | { type: 'review.created' }
  | { type: 'notification.created' }
  | { type: 'notification.updated' };

type Subscriber = (event: RealtimeEvent) => void;
type SubscriberMap = Map<string, Set<Subscriber>>;

const globalBus = globalThis as typeof globalThis & {
  qrestoEventSubscribers?: SubscriberMap;
};

const subscribers = globalBus.qrestoEventSubscribers ?? new Map<string, Set<Subscriber>>();
globalBus.qrestoEventSubscribers = subscribers;

function publish(channel: string, event: RealtimeEvent): void {
  const channelSubscribers = subscribers.get(channel);
  if (!channelSubscribers) return;

  for (const subscriber of [...channelSubscribers]) {
    try {
      subscriber(event);
    } catch (error: unknown) {
      console.error('Échec de diffusion d’un événement temps réel.', error);
      channelSubscribers.delete(subscriber);
    }
  }
  if (channelSubscribers.size === 0) subscribers.delete(channel);
}

function subscribe(channel: string, subscriber: Subscriber): () => void {
  const channelSubscribers = subscribers.get(channel) ?? new Set<Subscriber>();
  channelSubscribers.add(subscriber);
  subscribers.set(channel, channelSubscribers);

  return () => {
    channelSubscribers.delete(subscriber);
    if (channelSubscribers.size === 0) subscribers.delete(channel);
  };
}

export function publishRestaurantEvent(restaurantId: string, event: RealtimeEvent): void {
  publish(`restaurant:${restaurantId}`, event);
}

export function subscribeRestaurantEvents(
  restaurantId: string,
  subscriber: Subscriber
): () => void {
  return subscribe(`restaurant:${restaurantId}`, subscriber);
}

export function publishOrderEvent(
  restaurantId: string,
  trackingCode: string,
  type: 'order.created' | 'order.updated'
): void {
  const event: RealtimeEvent = { type, trackingCode };
  publishRestaurantEvent(restaurantId, event);
  publish(`order:${trackingCode}`, event);
}

export function subscribeOrderEvents(
  trackingCode: string,
  subscriber: Subscriber
): () => void {
  return subscribe(`order:${trackingCode}`, subscriber);
}
