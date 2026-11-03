import { describe, expect, it } from 'vitest';
import {
  aggregateRequestedQuantities,
  getInventoryMovementType,
  hasSufficientStock,
  isStockLow,
} from './stock';

describe('inventory stock logic', () => {
  it('aggregates repeated dish lines before stock deduction', () => {
    expect(aggregateRequestedQuantities([
      { dishId: 'dish-1', quantity: 2 },
      { dishId: 'dish-2', quantity: 1 },
      { dishId: 'dish-1', quantity: 3 },
    ])).toEqual(new Map([['dish-1', 5], ['dish-2', 1]]));
  });

  it('classifies stock adjustments and low-stock alerts', () => {
    expect(getInventoryMovementType(4)).toBe('RESTOCK');
    expect(getInventoryMovementType(-2)).toBe('ADJUSTMENT');
    expect(getInventoryMovementType(0)).toBeNull();
    expect(isStockLow(3, 3)).toBe(true);
    expect(isStockLow(4, 3)).toBe(false);
    expect(hasSufficientStock(4, 4)).toBe(true);
    expect(hasSufficientStock(3, 4)).toBe(false);
  });
});
