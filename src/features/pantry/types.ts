import type { UUID } from '@/lib/types';

export type PantryCategory = {
  id: UUID;
  name: string;
  color?: string;
};

export type PantryItemInput = {
  name: string;
  quantity: number;
  unit?: string;
  category_id?: UUID | null;
  expires_at?: string | null;
  low_stock_threshold?: number | null;
};
