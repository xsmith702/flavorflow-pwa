import { afterEach, describe, expect, it } from 'vitest';
import { usePantryStore } from './store';
import type { PantryItem } from '@/lib/types';

afterEach(() => {
  usePantryStore.setState({ items: [] });
});

describe('pantry store', () => {
  it('detects duplicates', () => {
    const a: PantryItem = { id: '1', household_id: 'h', name: 'Salt', quantity: 1 };
    usePantryStore.getState().addItem(a);
    const r = usePantryStore.getState().addItem({ ...a, id: '2' });
    expect(r.duplicate).toBe(true);
  });

  it('computes low stock ids', () => {
    const a: PantryItem = { id: '1', household_id: 'h', name: 'Rice', quantity: 1, low_stock_threshold: 2 };
    const b: PantryItem = { id: '2', household_id: 'h', name: 'Flour', quantity: 5, low_stock_threshold: 2 };
    usePantryStore.getState().setItems([a, b]);
    expect(usePantryStore.getState().lowStockIds()).toEqual(['1']);
  });
});
