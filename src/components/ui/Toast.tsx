"use client";
import { create } from 'zustand';
import { useEffect, useRef } from 'react';

type Toast = {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: { label: string; onClick: () => void } | undefined;
};
type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
};

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), ...t }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function ToastViewport() {
  const { toasts, remove } = useToast();
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    const mapRef = timers.current;
    // Create timers for new toasts
    toasts.forEach((t) => {
      if (!mapRef.has(t.id)) {
        const timeout = setTimeout(() => {
          remove(t.id);
          mapRef.delete(t.id);
        }, 5000);
        mapRef.set(t.id, timeout);
      }
    });
    // Cleanup timers for removed toasts
    const activeIds = new Set(toasts.map((t) => t.id));
    Array.from(mapRef.keys()).forEach((id) => {
      if (!activeIds.has(id)) {
        const timeout = mapRef.get(id);
        if (timeout) clearTimeout(timeout);
        mapRef.delete(id);
      }
    });
    return () => {
      mapRef.forEach((t) => clearTimeout(t));
      mapRef.clear();
    };
  }, [toasts, remove]);
  return (
    <div className="fixed bottom-4 right-4 grid gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass rounded-lg px-4 py-3 text-sm shadow-lg border-l-4 ${
            t.type === 'success'
              ? 'border-emerald-400'
              : t.type === 'error'
              ? 'border-rose-400'
              : 'border-cyan-400'
          }`}
          role="status"
        >
          <div className="flex items-center justify-between gap-6">
            <span>{t.message}</span>
            <div className="flex items-center gap-4 ml-auto">
              {t.action && (
                <button
                  className="text-cyan-300 hover:underline"
                  onClick={() => {
                    try { t.action?.onClick(); } finally { remove(t.id); }
                  }}
                >
                  {t.action.label}
                </button>
              )}
              <button className="text-cyan-300 hover:underline" onClick={() => remove(t.id)}>
              Close
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
