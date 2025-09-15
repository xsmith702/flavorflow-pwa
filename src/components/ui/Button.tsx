import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
};

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled,
  children,
  ...props 
}: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  
  const variants: Record<string, string> = {
    primary: 'text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-orange-500',
    secondary: 'text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-indigo-500',
    ghost: 'text-gray-300 bg-transparent hover:bg-white/10 hover:text-white focus:ring-white/20',
    danger: 'text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-red-500',
    outline: 'text-gray-300 border border-gray-600 bg-transparent hover:bg-white/5 hover:border-gray-500 hover:text-white focus:ring-white/20',
    link: 'text-orange-400 bg-transparent hover:text-orange-300 underline-offset-4 hover:underline focus:ring-orange-500',
  };
  
  const sizes: Record<string, string> = {
    xs: 'h-8 px-2 text-xs min-h-[44px]',
    sm: 'h-9 px-3 text-sm min-h-[44px]',
    md: 'h-10 px-4 text-sm min-h-[44px]',
    lg: 'h-12 px-6 text-base min-h-[44px]',
    xl: 'h-14 px-8 text-lg min-h-[44px]',
  };

  const isDisabled = disabled || loading;

  return (
    <button 
      className={clsx(
        base, 
        variants[variant], 
        sizes[size], 
        isDisabled && 'transform-none hover:transform-none',
        className
      )} 
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
