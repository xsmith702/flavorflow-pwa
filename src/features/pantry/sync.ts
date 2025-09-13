import type { PantryItem } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

const HAS_SUPABASE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function pushPantry(items: PantryItem[]) {
  if (!HAS_SUPABASE) return { ok: true, count: 0 } as const;
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from('pantry_items').upsert(items, { onConflict: 'id' });
  if (error) return { ok: false, error } as const;
  return { ok: true, count: items.length } as const;
}

export async function pullPantry(household_id: string) {
  if (!HAS_SUPABASE) return [] as PantryItem[];
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', household_id)
    .order('updated_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as PantryItem[];
}
