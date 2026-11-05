import { Prisma } from 'generated/prisma/client';

export const publiclyAvailableDishWhere = {
  isAvailable: true,
  OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }],
} satisfies Prisma.DishWhereInput;
