export interface TableData {
  id: string;
  number: number | string;
  capacity?: number;
  name?: string | null;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface TablesTabProps {
  restaurantId?: string;
  restaurantSlug?: string;
  restaurantName?: string;
  tables?: TableData[];
  onRefreshNeeded?: () => void;
  onOpenTableModal?: () => void;
}

export interface TableFormData {
  number: string;
  capacity: string;
  name: string;
}
