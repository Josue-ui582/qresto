import { describe, expect, it, vi } from 'vitest';
import {
  publishOrderEvent,
  publishRestaurantEvent,
  subscribeOrderEvents,
  subscribeRestaurantEvents,
} from './event-bus';

describe('restaurant and tracking event channels', () => {
  it('publishes order updates to both scoped channels and removes closed subscribers', () => {
    const restaurantSubscriber = vi.fn();
    const trackingSubscriber = vi.fn();
    const unsubscribeRestaurant = subscribeRestaurantEvents('restaurant-a', restaurantSubscriber);
    const unsubscribeTracking = subscribeOrderEvents('QR-ABCDEFG2', trackingSubscriber);

    publishOrderEvent('restaurant-a', 'QR-ABCDEFG2', 'order.updated');

    expect(restaurantSubscriber).toHaveBeenCalledWith({
      type: 'order.updated',
      trackingCode: 'QR-ABCDEFG2',
    });
    expect(trackingSubscriber).toHaveBeenCalledWith({
      type: 'order.updated',
      trackingCode: 'QR-ABCDEFG2',
    });

    unsubscribeRestaurant();
    unsubscribeTracking();
    publishOrderEvent('restaurant-a', 'QR-ABCDEFG2', 'order.created');

    expect(restaurantSubscriber).toHaveBeenCalledOnce();
    expect(trackingSubscriber).toHaveBeenCalledOnce();
  });

  it('does not deliver one restaurant’s event to another restaurant channel', () => {
    const subscriber = vi.fn();
    const unsubscribe = subscribeRestaurantEvents('restaurant-b', subscriber);

    publishRestaurantEvent('restaurant-a', { type: 'review.created' });

    expect(subscriber).not.toHaveBeenCalled();
    unsubscribe();
  });
});
