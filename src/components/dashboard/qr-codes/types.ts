export interface TableRestaurantData {
  id: string;
  name: string;
  slug: string;
}

export interface TableData {
  id: string;
  number: number;
  capacity?: number;
  name?: string | null;
  restaurantId?: string;
  restaurant?: TableRestaurantData;
}

export interface QrCodesTabProps {
  tables?: TableData[];
  restaurantSlug?: string;
  restaurantName?: string;
  onOpenQr?: (table: TableData) => void;
}
