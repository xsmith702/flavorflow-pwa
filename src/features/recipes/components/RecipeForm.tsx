"use client";
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Recipe } from '@/lib/types';
import { useUserRecipes } from '../userStore';
import { usePantryStore } from '@/features/pantry/store';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

type IngredientRow = { name: string; amount?: number; unit?: string };

export function RecipeForm({ initial, onSaved, onCancel }: { initial?: Recipe | null; onSaved?: (r: Recipe) => void; onCancel?: () => void }) {
  const addRecipe = useUserRecipes((s) => s.addRecipe);
  const updateRecipe = useUserRecipes((s) => s.updateRecipe);
  const computeMissing = useUserRecipes((s) => s.computeMissing);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [time, setTime] = useState<number | ''>(initial?.cookingTime ?? '');
  const [rows, setRows] = useState<IngredientRow[]>(initial?.ingredients ?? [{ name: '' }]);
  const pantryAdd = usePantryStore((s) => s.addItem);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setTime(initial.cookingTime ?? '');
      setRows(initial.ingredients ?? [{ name: '' }]);
    }
  }, [initial]);

  function updateRow(i: number, patch: Partial<IngredientRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() { setRows((r) => [...r, { name: '' }]); }
  function removeRow(i: number) { setRows((r) => r.filter((_, idx) => idx !== i)); }

  const recipe: Recipe = useMemo(() => ({
    id: initial?.id ?? 'temp',
    title: title.trim(),
    ingredients: rows.filter((r) => r.name.trim().length > 0),
    cookingTime: typeof time === 'number' ? time : undefined,
    isUserCreated: true,
  }), [initial?.id, title, rows, time]);

  const missing = computeMissing(recipe);

  function onQuickAdd(name: string) {
    if (!name.trim()) return;
    pantryAdd({
      id: crypto.randomUUID(),
      household_id: 'local',
      name: name.trim(),
      quantity: 1,
      unit: 'pcs',
      category_id: null,
      expires_at: null,
      low_stock_threshold: null,
    });
  }

  function onSave() {
    const base: Recipe = {
      id: initial?.id ?? '',
      title: title.trim(),
      ingredients: rows.filter((r) => r.name.trim().length > 0),
      cookingTime: typeof time === 'number' ? time : undefined,
      isUserCreated: true,
    };
    let saved: Recipe;
    if (initial?.id) {
      const patch = {
        title: base.title,
        ingredients: base.ingredients,
        cookingTime: base.cookingTime,
        isUserCreated: true as const,
      };
      updateRecipe(initial.id, patch);
      saved = { ...initial, ...patch, id: initial.id };
    } else {
      const r = addRecipe({
        title: base.title,
        ingredients: base.ingredients,
        cookingTime: base.cookingTime,
        sourceUrl: base.sourceUrl,
        image: base.image,
      });
      saved = r;
    }
    onSaved?.(saved);
  }

  const canSave = title.trim().length > 0 && rows.some((r) => r.name.trim().length > 0);

  return (
    <div className="space-y-8">
      {/* Recipe Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2">
          Recipe Details
        </h3>
        <div className="grid sm:grid-cols-6 gap-4">
          <div className="sm:col-span-4">
            <Input 
              id="title" 
              label="Recipe Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter recipe name"
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              id="cookingTime"
              label="Cooking Time (minutes)"
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value ? Number(e.target.value) : '')}
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 flex-1">
            Ingredients
          </h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={addRow} 
            className="flex items-center gap-2 ml-4"
          >
            <PlusIcon className="h-4 w-4" />
            Add Ingredient
          </Button>
        </div>
        
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="space-y-4">
                {/* Input Fields Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-9 gap-3">
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Ingredient Name
                    </label>
                    <Input
                      id={`name-${i}`}
                      placeholder="e.g., fresh tomatoes"
                      value={r.name}
                      onChange={(e) => updateRow(i, { name: e.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-1 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Amount
                    </label>
                    <Input
                      id={`amt-${i}`}
                      placeholder="2"
                      type="number"
                      value={r.amount ?? ''}
                      onChange={(e) => updateRow(i, { amount: e.target.value ? Number(e.target.value) : undefined })}
                    />
                  </div>
                  <div className="sm:col-span-1 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Unit
                    </label>
                    <Input
                      id={`unit-${i}`}
                      placeholder="cups"
                      value={r.unit ?? ''}
                      onChange={(e) => updateRow(i, { unit: e.target.value })}
                    />
                  </div>
                </div>
                
                {/* Action Buttons Row */}
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={!r.name.trim()}
                    onClick={() => onQuickAdd(r.name)}
                    className="flex items-center gap-1.5"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Add to Pantry
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => removeRow(i)}
                    className="flex items-center gap-1.5"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Ingredients Alert */}
      {missing.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-200">Missing from Pantry</h4>
              <p className="text-sm text-amber-300 mt-1">
                {missing.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
        <Button 
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2"
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          disabled={!canSave}
          className="px-6 py-2"
        >
          {initial?.id ? 'Update Recipe' : 'Save Recipe'}
        </Button>
      </div>
    </div>
  );
}
