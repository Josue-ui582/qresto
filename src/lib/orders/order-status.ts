import { OrderStatus } from '@/types';

const ALLOWED_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
): boolean {
  return ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus);
}
