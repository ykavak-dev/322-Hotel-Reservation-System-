import * as React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GuestsDropdownProps {
  adults: number;
  children: number;
  rooms: number;
  onChange: (opts: { adults: number; children: number; rooms: number }) => void;
}

export function GuestsDropdown({ adults, children, rooms, onChange }: GuestsDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const formatLabel = () =>
    `${adults} adult${adults !== 1 ? 's' : ''} · ${children} child${children !== 1 ? 'ren' : ''} · ${rooms} room${rooms !== 1 ? 's' : ''}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          {formatLabel()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="flex flex-col gap-4">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <Label htmlFor="adults">Adults</Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults: Math.max(1, adults - 1), children, rooms })}
                disabled={adults <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-4 text-center">{adults}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults: adults + 1, children, rooms })}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <Label htmlFor="children">Children</Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults, children: Math.max(0, children - 1), rooms })}
                disabled={children <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-4 text-center">{children}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults, children: children + 1, rooms })}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Rooms */}
          <div className="flex items-center justify-between">
            <Label htmlFor="rooms">Rooms</Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults, children, rooms: Math.max(1, rooms - 1) })}
                disabled={rooms <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-4 text-center">{rooms}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => onChange({ adults, children, rooms: rooms + 1 })}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}