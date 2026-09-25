export interface CategoryOption {
  id: string;
  name: string;
}

export interface DishData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId: string;
  restaurantId: string;
  category?: CategoryOption;
}

export interface DishFormData {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
}

export interface DishesTabProps {
  restaurantId?: string;
  dishes?: DishData[];
  categories?: CategoryOption[];
  onRefreshNeeded?: () => void;
}

export interface DishStats {
  total: number;
  available: number;
  unavailable: number;
}

export interface ActionNoticeState {
  type: 'success' | 'error';
  msg: string;
}
