import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className, hover = true, gradient = false }: CardProps) {
  return (
    <div 
      className={clsx(
        'glass rounded-2xl transition-all duration-300',
        hover && 'glass-hover',
        gradient && 'bg-gradient-to-br from-white/10 to-white/5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={clsx('px-6 py-4 border-b border-white/10', className)}>
      {children}
    </div>
  );
}

export function CardContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={clsx('px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={clsx('px-6 py-4 border-t border-white/10', className)}>
      {children}
    </div>
  );
}
