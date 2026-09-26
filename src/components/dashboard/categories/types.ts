export interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  order?: number;
  restaurantId: string;
  _count?: {
    dishes: number;
  };
}

export interface CategoryFormData {
  name: string;
  description: string;
  sortOrder: number;
}

export interface CategoriesTabProps {
  restaurantId?: string;
  categories?: CategoryData[];
  onRefreshNeeded?: () => void;
  onOpenCategoryModal?: () => void;
}

export interface ActionNoticeState {
  type: 'success' | 'error';
  msg: string;
}
