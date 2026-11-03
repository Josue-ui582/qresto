import { describe, expect, it } from 'vitest';
import { calculateOrderTotals, resolveSelectedDishOptions } from './order-pricing';

const optionGroups = [{
  id: 'group-required',
  minSelection: 1,
  maxSelection: 1,
  isRequired: true,
  options: [
    { id: 'option-a', name: 'Sauce A', price: 250, available: true },
    { id: 'option-unavailable', name: 'Sauce B', price: 0, available: false },
  ],
}];

describe('resolveSelectedDishOptions', () => {
  it('accepts valid selected options and rejects missing, unavailable or foreign IDs', () => {
    expect(resolveSelectedDishOptions(optionGroups, ['option-a'])).toEqual([
      { id: 'option-a', name: 'Sauce A', price: 250 },
    ]);
    expect(resolveSelectedDishOptions(optionGroups, [])).toBeNull();
    expect(resolveSelectedDishOptions(optionGroups, ['option-unavailable'])).toBeNull();
    expect(resolveSelectedDishOptions(optionGroups, ['foreign-option'])).toBeNull();
  });
});

describe('calculateOrderTotals', () => {
  it('calculates server-priced subtotal and delivery fees', () => {
    expect(calculateOrderTotals([
      { unitPrice: 1_000, quantity: 2 },
      { unitPrice: 1_250, quantity: 1 },
    ], 500)).toEqual({ subtotal: 3_250, total: 3_750 });
  });

  it('rejects invalid quantities, negative prices and unsafe totals', () => {
    expect(calculateOrderTotals([{ unitPrice: 1_000, quantity: 0 }], 0)).toBeNull();
    expect(calculateOrderTotals([{ unitPrice: -1, quantity: 1 }], 0)).toBeNull();
    expect(calculateOrderTotals([{ unitPrice: 2_147_483_647, quantity: 2 }], 0)).toBeNull();
  });
});
