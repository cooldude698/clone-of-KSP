import { cn } from '@/lib/utils';

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variantStyles = {
    default: 'bg-steel-600 text-paper-100 border-steel-600/50',
    critical: 'bg-critical-500/15 text-critical-500 border-critical-500/30',
    warning: 'bg-warn-500/15 text-warn-500 border-warn-500/30',
    success: 'bg-success-500/15 text-success-500 border-success-500/30',
    info: 'bg-phosphor-500/15 text-phosphor-500 border-phosphor-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border transition-colors duration-200',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
