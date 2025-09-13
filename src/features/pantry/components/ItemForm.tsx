"use client";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { usePantryStore } from '../store';
import type { PantryItem } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1),
  quantity: z.preprocess((v) => Number(v), z.number().min(0)),
  unit: z.string().optional(),
  category_id: z.preprocess((v) => (v === '' ? undefined : v), z.string().min(1).optional()),
  expires_at: z.preprocess((v) => (v === '' ? undefined : v), z.string().nullable().optional()),
  low_stock_threshold: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number().min(0).optional(),
  ).optional(),
});

export function ItemForm({
  categories,
  onCreated,
  onSaved,
  onCancel,
  initial,
  mode = 'add',
}: {
  categories: Array<{ id: string; name: string }>;
  onCreated?: (item: PantryItem, opts: { duplicate: boolean }) => void;
  onSaved?: (item: PantryItem) => void;
  onCancel?: () => void;
  initial?: PantryItem | null;
  mode?: 'add' | 'edit';
}) {
  const addItem = usePantryStore((s) => s.addItem);
  const updateItem = usePantryStore((s) => s.updateItem);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  // When editing, prefill form with existing values
  useEffect(() => {
    if (initial && mode === 'edit') {
      reset({
        name: initial.name,
        quantity: initial.quantity as unknown as number,
        unit: initial.unit ?? '',
        category_id: initial.category_id ?? '',
        expires_at: initial.expires_at ?? '',
        low_stock_threshold: initial.low_stock_threshold ?? undefined,
      });
    }
  }, [initial, mode, reset]);

  function onSubmit(values: z.infer<typeof schema>) {
    if (mode === 'edit' && initial) {
      const patch: Partial<PantryItem> = {
        name: values.name.trim(),
        quantity: values.quantity,
        unit: values.unit,
        category_id: values.category_id ?? null,
        expires_at: values.expires_at ?? null,
        low_stock_threshold: values.low_stock_threshold ?? null,
      };
      updateItem(initial.id, patch);
      const updated: PantryItem = { ...initial, ...patch };
      onSaved?.(updated);
      return;
    }

    const newItem: PantryItem = {
      id: crypto.randomUUID(),
      household_id: 'local',
      name: values.name.trim(),
      quantity: values.quantity,
      unit: values.unit,
      category_id: values.category_id ?? null,
      expires_at: values.expires_at ?? null,
      low_stock_threshold: values.low_stock_threshold ?? null,
    };
    const result = addItem(newItem);
    // Preserve chosen category and unit for quick subsequent adds
    reset({
      name: '',
      quantity: 1 as unknown as number,
      unit: values.unit ?? '',
      category_id: values.category_id ?? '',
      expires_at: '',
      low_stock_threshold: values.low_stock_threshold,
    });
    onCreated?.(newItem, result);
    onSaved?.(newItem);
  }

  // Build alphabetically sorted list and a few logical groups for easier scanning
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  const groupBy = (label: string, ids: string[]) => ({
    label,
    options: sorted
      .filter((c) => ids.includes(c.id))
      .map((c) => ({ value: c.id, label: c.name })),
  });
  const remaining = sorted.filter((c) => ![
    'dairy','vegetables','fruits','breads_bakery','seafood','frozen','beverages','snacks','condiments','canned','baking','oils_vinegars','breakfast_cereal','sweets_desserts','pasta_noodles','spices','proteins','produce','grains'
  ].includes(c.id));
  const groups = [
    groupBy('🥬 Fresh', ['vegetables', 'fruits', 'dairy', 'proteins', 'seafood']),
    groupBy('🧂 Pantry', ['grains','pasta_noodles','canned','condiments','oils_vinegars','baking','spices']),
    groupBy('❄️ Frozen & Snacks', ['frozen','snacks']),
    groupBy('🥖 Bakery & Breakfast', ['breads_bakery','breakfast_cereal','sweets_desserts']),
    groupBy('🥤 Beverages', ['beverages']),
    {
      label: '⋯ Other',
      options: remaining.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

  return (
  <form className="grid gap-4 sm:grid-cols-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="sm:col-span-3">
        <Input id="name" label="Item" {...register('name')} error={errors.name?.message} />
      </div>
      <div className="sm:col-span-1">
        <Input
          id="quantity"
          label="Qty"
          type="number"
          step="0.01"
          {...register('quantity')}
          error={errors.quantity?.message}
        />
      </div>
      <div className="sm:col-span-2">
        <Input id="unit" label="Unit" placeholder="e.g., pcs, g, ml" {...register('unit')} />
      </div>
      <div className="sm:col-span-2">
        <Select
          id="category_id"
          label="Category"
          {...register('category_id')}
          options={[{ value: '', label: 'Uncategorized' }]}
          groups={groups}
        />
      </div>
      <div className="sm:col-span-2">
        <Input id="expires_at" label="Expires" type="date" {...register('expires_at')} />
      </div>
      <div className="sm:col-span-2">
        <Input
          id="low_stock_threshold"
          label="Low stock at"
          type="number"
          {...register('low_stock_threshold')}
        />
      </div>
      <div className="sm:col-span-6 flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="min-w-36">{mode === 'edit' ? 'Save changes' : 'Add to pantry'}</Button>
      </div>
    </form>
  );
}
