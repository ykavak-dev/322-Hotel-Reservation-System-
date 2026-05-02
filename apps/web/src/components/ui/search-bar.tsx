import { Calendar, MapPin, Users } from 'lucide-react';
import { Button } from './button';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 flex gap-4 ${className}`}>
      <div className="flex-1 flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <MapPin className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Where are you going?"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <Calendar className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Check in - Check out"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3">
        <Users className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="2 guests, 1 room"
          className="flex-1 outline-none text-sm"
        />
      </div>
      <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8">
        Search
      </Button>
    </div>
  );
}