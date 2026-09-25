export type SettingsSection = 'general' | 'opening' | 'service' | 'notifications' | 'security';

export interface DaySchedule {
  open: string;
  close: string;
  active: boolean;
}

export interface OpeningHoursMap {
  [key: string]: DaySchedule;
}

export interface RestaurantSettingsData {
  id?: string;
  restaurantId?: string;
  name: string;
  phone: string;
  address: string;
  currency: string;
  description: string;
  enableQrOrders: boolean;
  enableSoundAlerts: boolean;
  notificationEmail: string;
  notificationPhone?: string;
  serviceFeePercent: number;
  wifiName?: string;
  wifiPassword?: string;
  openingHours?: string | OpeningHoursMap;
}

export interface SettingsTabProps {
  restaurantId?: string;
  initialSettings?: RestaurantSettingsData;
  onOpenSettings?: () => void;
  onSavedSuccess?: () => void;
}
