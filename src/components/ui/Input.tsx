import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Props = InputHTMLAttributes<HTMLInputElement> & { 
  label?: string; 
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, label, id, error, helperText, leftIcon, rightIcon, ...props },
  ref,
) {
  const inputEl = (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          'w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-gray-400',
          'border-gray-600 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
          'transition-all duration-200',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {rightIcon}
        </div>
      )}
    </div>
  );

  if (!label) return inputEl;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-200" htmlFor={id}>
        {label}
      </label>
      {inputEl}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
