export interface RequestedStockLine {
  dishId: string;
  quantity: number;
}

export function aggregateRequestedQuantities(lines: RequestedStockLine[]): Map<string, number> {
  const quantities = new Map<string, number>();
  for (const line of lines) {
    quantities.set(line.dishId, (quantities.get(line.dishId) ?? 0) + line.quantity);
  }
  return quantities;
}

export function getInventoryMovementType(quantityChange: number): 'RESTOCK' | 'ADJUSTMENT' | null {
  if (quantityChange > 0) return 'RESTOCK';
  if (quantityChange < 0) return 'ADJUSTMENT';
  return null;
}

export function isStockLow(quantity: number, threshold: number): boolean {
  return quantity <= threshold;
}

export function hasSufficientStock(stockQuantity: number, requestedQuantity: number): boolean {
  return stockQuantity >= requestedQuantity;
}
