import { cn } from '@/lib/utils';

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-steel-600/35 transition-colors duration-200',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
