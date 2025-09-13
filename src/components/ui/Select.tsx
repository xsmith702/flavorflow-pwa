import { clsx } from 'clsx';
import type { SelectHTMLAttributes } from 'react';

type Option = { label: string; value: string };
type Group = { label: string; options: Option[] };

export function Select({
  id,
  label,
  options,
  groups,
  className,
  ...props
}: {
  id: string;
  label?: string;
  options?: Option[];
  groups?: Group[];
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const selectEl = (
    <select
      id={id}
      className={clsx(
        // Match Input.tsx dark theme styles
        'w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white',
        'border-gray-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
        'transition-all duration-200',
        className,
      )}
      {...props}
    >
      {options?.map((o) => (
        <option
          key={o.value}
          value={o.value}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          {o.label}
        </option>
      ))}
      {groups?.map((g) => (
        <optgroup
          key={g.label}
          label={g.label}
          className="bg-gray-950 text-gray-300 border-b border-gray-700 font-semibold"
        >
          {g.options.map((o) => (
            <option
              key={o.value}
              value={o.value}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              {o.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
  if (!label) return selectEl;
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-200" htmlFor={id}>
        {label}
      </label>
      {selectEl}
    </div>
  );
}
