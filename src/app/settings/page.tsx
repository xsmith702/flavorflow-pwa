"use client";
import { useState } from 'react';
import { CategoryManager } from '@/features/categories/components/CategoryManager';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const [household, setHousehold] = useState('local');
  return (
    <main className="mx-auto max-w-3xl p-6 grid gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="grid gap-3">
        <Input id="household" label="Household ID" value={household} onChange={(e) => setHousehold(e.target.value)} />
        <p className="text-xs text-neutral-600">Share this ID with your partner to sync pantry items across devices.</p>
      </section>
      <section className="grid gap-3">
        <h2 className="text-lg font-medium">Categories</h2>
        <CategoryManager />
      </section>
    </main>
  );
}
