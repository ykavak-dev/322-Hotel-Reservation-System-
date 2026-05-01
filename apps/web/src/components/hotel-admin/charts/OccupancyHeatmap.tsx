// apps/web/src/components/hotel-admin/charts/OccupancyHeatmap.tsx
import { format, startOfWeek, addDays } from 'date-fns';
import { cn } from '../../../lib/utils';

interface OccupancyHeatmapProps {
  occupancyRate?: number;
}

export const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ occupancyRate = 65 }) => {
  const now = new Date();
  const firstDay = startOfWeek(new Date(now.getFullYear(), now.getMonth(), 1));
  const weeks: Date[][] = [];

  let current = firstDay;
  for (let w = 0; w < 5; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-muted';
    if (rate < 30) return 'bg-green-200';
    if (rate < 60) return 'bg-green-400';
    if (rate < 80) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getOccupancy = (day: Date) => {
    if (day > now) return 0;
    const seed = day.getDate();
    return ((seed * occupancyRate * 7) % 100);
  };

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-2">{format(now, 'MMMM yyyy')} — Occupancy Heatmap</p>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <p key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</p>
        ))}
        {weeks.flat().map((day, idx) => {
          const rate = getOccupancy(day);
          const isCurrentMonth = day.getMonth() === now.getMonth();
          return (
            <div
              key={idx}
              className={cn(
                'h-8 w-full rounded-sm flex items-center justify-center text-xs font-medium',
                getColor(rate),
                !isCurrentMonth && 'opacity-30'
              )}
              title={`${format(day, 'MMM d')}: ${rate}% occupied`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2 justify-end">
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-muted inline-block" /> 0%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> &lt;30%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> 30-60%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> 60-80%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> &gt;80%</span>
      </div>
    </div>
  );
};