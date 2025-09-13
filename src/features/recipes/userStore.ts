import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe } from '@/lib/types';
import { usePantryStore } from '@/features/pantry/store';

type UserRecipe = Recipe & { id: string; isUserCreated: true };

type UserRecipeState = {
  recipes: UserRecipe[];
  addRecipe: (r: Omit<UserRecipe, 'id' | 'isUserCreated'>) => UserRecipe;
  updateRecipe: (id: string, patch: Partial<UserRecipe>) => void;
  computeMissing: (r: Recipe) => string[];
};

const selectPantryNames = () => {
  const items = usePantryStore.getState().items;
  return new Set(items.map((i) => i.name.toLowerCase()));
};

export const useUserRecipes = create<UserRecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      addRecipe: (r) => {
        const recipe: UserRecipe = { ...r, id: crypto.randomUUID(), isUserCreated: true };
        set({ recipes: [recipe, ...get().recipes] });
        return recipe;
      },
      updateRecipe: (id, patch) => set({ recipes: get().recipes.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
      computeMissing: (r) => {
        const set = selectPantryNames();
        return (r.ingredients || [])
          .map((i) => i.name.toLowerCase())
          .filter((n) => !set.has(n));
      },
    }),
    { name: 'user-recipes' },
  ),
);
