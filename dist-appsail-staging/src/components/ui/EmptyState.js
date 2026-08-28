import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-steel-600 bg-steel-700/20 text-center transition-colors duration-200',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-10 h-10 text-steel-600 mb-3" />}
      <h3 className="text-sm font-semibold text-paper-100 mb-1">{title}</h3>
      {description && <p className="text-xs text-paper-100/50 max-w-xs">{description}</p>}
    </div>
  );
}

export { EmptyState };
