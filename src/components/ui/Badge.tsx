import { clsx } from 'clsx';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'low' | 'expiring';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className 
}: Props) {
  const base = 'inline-flex items-center rounded-full font-medium transition-all duration-200';
  
  const variants: Record<string, string> = {
    default: 'bg-gray-600/20 text-gray-300 border border-gray-600/30',
    success: 'bg-green-500/20 text-green-300 border border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    low: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    expiring: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={clsx(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
