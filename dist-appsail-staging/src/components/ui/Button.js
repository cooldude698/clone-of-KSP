import { cn } from '@/lib/utils';
import Spinner from './Spinner';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  ...props
}) {
  const variantStyles = {
    primary: 'bg-phosphor-500 hover:bg-phosphor-500/80 text-paper-100 shadow-sm focus:ring-phosphor-500/30',
    secondary: 'bg-steel-700 hover:bg-steel-600 border border-steel-600 text-paper-100 focus:ring-steel-600/30',
    ghost: 'hover:bg-steel-700/50 text-paper-100 hover:text-paper-100',
    danger: 'bg-critical-500/20 hover:bg-critical-500/30 border border-critical-500/30 text-critical-500 focus:ring-critical-500/30',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2 text-current" />}
      {children}
    </button>
  );
}

export { Button };
