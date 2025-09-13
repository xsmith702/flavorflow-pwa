import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PantryItem } from '@/lib/types';

type PantryState = {
  items: PantryItem[];
  setItems: (items: PantryItem[]) => void;
  addItem: (item: PantryItem) => { duplicate: boolean };
  updateItem: (id: string, patch: Partial<PantryItem>) => void;
  removeItem: (id: string) => void;
  lowStockIds: (now?: Date) => string[];
};

function isLow(item: PantryItem): boolean {
  const threshold = item.low_stock_threshold ?? Number(process.env.NEXT_PUBLIC_LOW_STOCK_DEFAULT ?? 2);
  return item.quantity <= threshold;
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (item) => {
        const dup = get()
          .items.map((i) => i.name.trim().toLowerCase())
          .includes(item.name.trim().toLowerCase());
        set({ items: [item, ...get().items] });
        return { duplicate: dup };
      },
      updateItem: (id, patch) =>
        set({ items: get().items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      lowStockIds: () => get().items.filter(isLow).map((i) => i.id),
    }),
    { name: 'pantry-store' },
  ),
);
