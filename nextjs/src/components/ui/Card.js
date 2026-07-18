import { cn } from '@/lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-steel-700 border border-steel-600/50 rounded-lg p-4 shadow-sm text-paper-100 transition-colors duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
