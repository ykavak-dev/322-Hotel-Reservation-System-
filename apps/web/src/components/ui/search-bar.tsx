import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from './button';
import { DateRangePicker } from '@/components/hotels/DateRangePicker';
import { GuestsDropdown } from '@/components/hotels/GuestsDropdown';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange.from) params.set('checkIn', dateRange.from.toISOString().split('T')[0]);
    if (dateRange.to) params.set('checkOut', dateRange.to.toISOString().split('T')[0]);
    params.set('adults', String(guests.adults));
    params.set('children', String(guests.children));
    params.set('rooms', String(guests.rooms));
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 ${className}`}>
      {/* Location Input */}
      <div className="flex-1 h-12 flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 bg-white shadow-sm">
        <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
        <input
          type="text"
          placeholder="Where are you going?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full outline-none text-sm font-medium text-gray-900 placeholder:text-gray-500 bg-transparent"
        />
      </div>

      {/* Date Range Picker */}
      <div className="h-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="h-full border-0 rounded-xl"
        />
      </div>

      {/* Guests Dropdown */}
      <div className="h-12 border-2 border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <GuestsDropdown
          adults={guests.adults}
          children={guests.children}
          rooms={guests.rooms}
          onChange={setGuests}
        />
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        className="h-12 px-8 font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md transition-colors"
      >
        Search
      </Button>
    </div>
  );
}
