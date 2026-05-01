// apps/web/src/components/hotel-admin/StatsCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('flex-1 min-w-[200px]', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trend && (
              <p className={cn('text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};