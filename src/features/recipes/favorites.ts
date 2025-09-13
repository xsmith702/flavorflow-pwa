import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Recipe } from '@/lib/types';

type FavState = {
  favorites: Record<string, Recipe>;
  toggle: (recipe: Recipe) => void;
  isFav: (id: string) => boolean;
};

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      favorites: {},
      toggle: (recipe) => {
        const f = { ...get().favorites };
        if (f[recipe.id]) delete f[recipe.id];
        else f[recipe.id] = recipe;
        set({ favorites: f });
      },
      isFav: (id) => Boolean(get().favorites[id]),
    }),
    { name: 'recipe-favorites' },
  ),
);
