import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/lib/types';

type CategoryState = {
  categories: Category[];
  addCategory: (name: string) => Category;
  removeCategory: (id: string) => void;
};

const DEFAULT_CATEGORIES: Category[] = [
  // Keep existing ones for backward compatibility
  { id: 'spices', name: 'Spices & Herbs' },
  { id: 'proteins', name: 'Proteins' },
  { id: 'produce', name: 'Produce' },
  { id: 'grains', name: 'Grains' },
  // New commonly used grocery categories
  { id: 'dairy', name: 'Dairy' },
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'breads_bakery', name: 'Breads & Bakery' },
  { id: 'seafood', name: 'Seafood' },
  { id: 'frozen', name: 'Frozen' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'condiments', name: 'Condiments & Sauces' },
  { id: 'canned', name: 'Canned & Jarred' },
  { id: 'baking', name: 'Baking' },
  { id: 'oils_vinegars', name: 'Oils & Vinegars' },
  { id: 'breakfast_cereal', name: 'Breakfast & Cereal' },
  { id: 'sweets_desserts', name: 'Sweets & Desserts' },
  { id: 'pasta_noodles', name: 'Pasta & Noodles' },
];

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      addCategory: (name) => {
        const cat: Category = { id: crypto.randomUUID(), name };
        set({ categories: [...get().categories, cat] });
        return cat;
      },
      removeCategory: (id) => set({ categories: get().categories.filter((c) => c.id !== id) }),
    }),
    {
      name: 'category-store',
      version: 2,
      migrate: (state: unknown, version: number) => {
        const persisted = (state ?? {}) as { categories?: Category[] };
        // Merge in any new default categories without removing user-defined ones
        if (version < 2) {
          const existing: Category[] = persisted.categories ?? [];
          const existingIds = new Set(existing.map((c) => c.id));
          const merged = [
            ...existing,
            ...DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id)),
          ];
          return { ...persisted, categories: merged };
        }
        return persisted;
      },
    },
  ),
);
