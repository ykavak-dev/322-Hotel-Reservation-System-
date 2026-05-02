import * as React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

interface DateRangePickerProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatLabel = () => {
    if (!dateRange.from && !dateRange.to) return 'Select dates';
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d')} → ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    if (dateRange.from) return `${format(dateRange.from, 'MMM d, yyyy')} → Select end`;
    return 'Select dates';
  };

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to });
      setOpen(false);
    } else if (range?.from) {
      onDateRangeChange({ from: range.from, to: undefined });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`h-full px-4 justify-start font-normal border-0 rounded-lg text-gray-700 ${className ?? ''}`}
        >
          {formatLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: dateRange.from, to: dateRange.to }}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={(date: Date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}