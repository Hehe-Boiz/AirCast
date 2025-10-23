import { Button } from './ui/button';
import { cn } from './ui/utils';

type OptionButtonProps = {
  icon: React.ReactNode;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'purple';
  className?: string;
};

export function OptionButton({
  icon,
  label,
  description,
  isSelected,
  onClick,
  variant = 'green',
  className,
}: OptionButtonProps) {
  const variants = {
    green:
      'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30',
    yellow:
      'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30',
    orange:
      'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30',
    red:
      'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30',
    purple:
      'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30',
  };

  const hoverVariants = {
    green: 'hover:border-green-300 hover:bg-green-50',
    yellow: 'hover:border-yellow-300 hover:bg-yellow-50',
    orange: 'hover:border-orange-300 hover:bg-orange-50',
    red: 'hover:border-red-300 hover:bg-red-50',
    purple: 'hover:border-purple-300 hover:bg-purple-50',
  };

  return (
    <Button
      type="button"
      variant={isSelected ? 'default' : 'outline'}
      className={cn(
        'h-auto py-6 flex flex-col gap-3 rounded-xl transition-all',
        isSelected ? variants[variant] : hoverVariants[variant],
        className
      )}
      onClick={onClick}
    >
      {icon}
      <div className="text-center">
        <div className="mb-1">{label}</div>
        <div className="text-xs opacity-80">{description}</div>
      </div>
    </Button>
  );
}