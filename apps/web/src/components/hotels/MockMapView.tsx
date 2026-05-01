import { MapPin } from 'lucide-react';

interface MockMapViewProps {
  hotelCount: number;
  location?: string;
}

export function MockMapView({ hotelCount, location }: MockMapViewProps) {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-700">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <MapPin className="h-12 w-12 text-blue-500" />
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
            {hotelCount > 9 ? '9+' : hotelCount}
          </div>
        </div>
        <p className="text-center text-sm font-medium text-blue-700 dark:text-blue-300">
          {hotelCount} hotel{hotelCount !== 1 ? 's' : ''}
          {location ? ` in ${location}` : ' found'}
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-400">
          Map view — powered by placeholder
        </p>
      </div>
    </div>
  );
}