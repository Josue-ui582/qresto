import type { StaffRole, UserRole } from 'generated/prisma/enums';

export const API_PERMISSIONS = [
  'MENU_READ',
  'MENU_WRITE',
  'ORDERS_READ',
  'ORDERS_UPDATE',
  'TABLES_READ',
  'TABLES_WRITE',
  'QR_READ',
  'ANALYTICS_READ',
  'TEAM_ADMIN',
  'SETTINGS_ADMIN',
  'SUBSCRIPTION_ADMIN',
] as const;

export type ApiPermission = (typeof API_PERMISSIONS)[number];

const OWNER_PERMISSIONS = new Set<ApiPermission>(API_PERMISSIONS);

const STAFF_ROLE_PERMISSIONS: Record<StaffRole, ReadonlySet<ApiPermission>> = {
  MANAGER: new Set([
    'MENU_READ',
    'MENU_WRITE',
    'ORDERS_READ',
    'ORDERS_UPDATE',
    'TABLES_READ',
    'TABLES_WRITE',
    'QR_READ',
    'ANALYTICS_READ',
  ]),
  CHEF: new Set(['MENU_READ', 'MENU_WRITE', 'ORDERS_READ', 'ORDERS_UPDATE']),
  WAITER: new Set(['ORDERS_READ', 'ORDERS_UPDATE', 'TABLES_READ', 'QR_READ']),
  CASHIER: new Set(['ORDERS_READ', 'ORDERS_UPDATE', 'ANALYTICS_READ']),
  DELIVERY: new Set(['ORDERS_READ', 'ORDERS_UPDATE']),
};

export function roleHasPermission(
  role: UserRole,
  staffRole: StaffRole | null,
  permission: ApiPermission
): boolean {
  if (role === 'RESTAURANT_OWNER') {
    return OWNER_PERMISSIONS.has(permission);
  }

  return role === 'RESTAURANT_STAFF' &&
    staffRole !== null &&
    STAFF_ROLE_PERMISSIONS[staffRole].has(permission);
}
