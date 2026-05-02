import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from './button';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-12 flex items-center gap-3 border border-gray-200 rounded-lg px-4">
        <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Where are you going?"
          className="w-full outline-none text-sm"
        />
      </div>
      <div className="h-12 flex items-center gap-3 border border-gray-200 rounded-lg px-4">
        <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Check in - Check out"
          className="outline-none text-sm"
        />
      </div>
      <div className="h-12 flex items-center gap-3 border border-gray-200 rounded-lg px-4">
        <Users className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="2 guests, 1 room"
          className="outline-none text-sm"
        />
      </div>
      <Button className="h-12 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 rounded-lg">
        Search
      </Button>
    </div>
  );
}