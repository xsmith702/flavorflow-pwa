"use client";
import { useState } from 'react';
import { useCategoryStore } from '../store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CategoryManager({ onSelect }: { onSelect?: (id: string) => void }) {
  const { categories, addCategory, removeCategory } = useCategoryStore();
  const [name, setName] = useState('');
  return (
    <div className="grid gap-3">
      <div className="flex gap-2">
        <Input id="newcat" placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => name && (addCategory(name), setName(''))}>Add</Button>
      </div>
      <ul className="grid gap-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between">
            <button className="text-left underline text-teal-700" onClick={() => onSelect?.(c.id)}>
              {c.name}
            </button>
            <Button size="sm" variant="danger" onClick={() => removeCategory(c.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
