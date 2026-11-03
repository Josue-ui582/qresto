export function canReviewOrder(status: string, alreadyReviewed: boolean): boolean {
  return status === 'DELIVERED' && !alreadyReviewed;
}
