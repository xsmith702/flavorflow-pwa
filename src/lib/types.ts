export type UUID = string;

export type UserID = UUID;

export interface Household {
  id: UUID;
  name: string;
  created_at: string;
}

export type Category = {
  id: UUID;
  name: string;
  color?: string;
  created_at?: string;
};

export type PantryItem = {
  id: UUID;
  household_id: UUID;
  name: string;
  quantity: number;
  unit?: string;
  category_id?: UUID | null;
  expires_at?: string | null;
  low_stock_threshold?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type Recipe = {
  id: string; // from external API or internal favorite id
  title: string;
  image?: string;
  sourceUrl?: string;
  ingredients: Array<{ name: string; amount?: number; unit?: string }>;
  missingIngredients?: string[];
  cookingTime?: number; // minutes
  isUserCreated?: boolean;
};
