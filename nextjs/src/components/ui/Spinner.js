import { cn } from '@/lib/utils';

export default function Spinner({ size = 'md', className, ...props }) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent border-paper-100/70',
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
