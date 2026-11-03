export interface SelectableDishOption {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface SelectableDishOptionGroup {
  id: string;
  minSelection: number;
  maxSelection: number;
  isRequired: boolean;
  options: SelectableDishOption[];
}

export interface SelectedDishOption {
  id: string;
  name: string;
  price: number;
}

export function getSelectedDishOptionTotal(
  groups: SelectableDishOptionGroup[],
  selectedIds: string[]
): number {
  const selectedIdsSet = new Set(selectedIds);
  return groups
    .flatMap((group) => group.options)
    .filter((option) => selectedIdsSet.has(option.id))
    .reduce((total, option) => total + option.price, 0);
}

export function resolveSelectedDishOptions(
  groups: SelectableDishOptionGroup[],
  selectedIds: string[]
): SelectedDishOption[] | null {
  if (new Set(selectedIds).size !== selectedIds.length) return null;

  const optionsById = new Map(
    groups.flatMap((group) => group.options.map((option) => [option.id, { group, option }] as const))
  );
  const selected: Array<{ group: SelectableDishOptionGroup; option: SelectableDishOption }> = [];
  for (const id of selectedIds) {
    const entry = optionsById.get(id);
    if (!entry || !entry.option.available || entry.option.price < 0) return null;
    selected.push(entry);
  }

  for (const group of groups) {
    const selectionCount = selected.filter((entry) => entry?.group.id === group.id).length;
    const minimum = group.isRequired ? Math.max(1, group.minSelection) : group.minSelection;
    if (selectionCount < minimum || selectionCount > group.maxSelection) return null;
  }

  return selected.map(({ option }) => ({
    id: option.id,
    name: option.name,
    price: option.price,
  }));
}

export function calculateOrderTotals(
  items: Array<{ unitPrice: number; quantity: number }>,
  deliveryFee: number
): { subtotal: number; total: number } | null {
  if (
    !Number.isSafeInteger(deliveryFee) ||
    deliveryFee < 0 ||
    items.some(({ unitPrice, quantity }) =>
      !Number.isSafeInteger(unitPrice) ||
      unitPrice < 0 ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    )
  ) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + deliveryFee;
  if (
    !Number.isSafeInteger(subtotal) ||
    !Number.isSafeInteger(total) ||
    total > 2_147_483_647
  ) {
    return null;
  }

  return { subtotal, total };
}
