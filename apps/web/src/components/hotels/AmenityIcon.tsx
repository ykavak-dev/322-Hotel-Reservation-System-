import {
  Wifi,
  Waves,
  ParkingCircle,
  Sparkles,
  Coffee,
  Dumbbell,
  Check,
  Utensils,
  Car,
  Users,
  Building,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const AMENITY_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  'free wifi': Wifi,
  pool: Waves,
  'swimming pool': Waves,
  parking: ParkingCircle,
  spa: Sparkles,
  breakfast: Coffee,
  'fine dining': Coffee,
  gym: Dumbbell,
  'fitness center': Dumbbell,
  beach: Waves,
  'beach access': Waves,
  restaurant: Utensils,
  'room service': Utensils,
  concierge: Building,
  'ski-in/ski-out': Star,
  'hot tub': Sparkles,
  fireplace: Sparkles,
  'ski storage': Building,
  'shuttle service': Car,
  'airport shuttle': Car,
  'valet parking': Car,
  bar: Utensils,
  'infinity pool': Waves,
  'rooftop bar': Utensils,
  'business center': Building,
  'kids club': Users,
};

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

export function AmenityIcon({ amenity, className }: AmenityIconProps) {
  const Icon = AMENITY_MAP[amenity.toLowerCase()] ?? Check;
  return <Icon className={className ?? 'h-4 w-4'} />;
}

export function getAmenityLabel(amenity: string): string {
  const labels: Record<string, string> = {
    wifi: 'WiFi',
    'free wifi': 'Free WiFi',
    pool: 'Pool',
    'swimming pool': 'Pool',
    parking: 'Parking',
    spa: 'Spa',
    breakfast: 'Breakfast',
    'fine dining': 'Fine Dining',
    gym: 'Gym',
    'fitness center': 'Fitness Center',
    beach: 'Beach',
    'beach access': 'Beach Access',
    restaurant: 'Restaurant',
    'room service': 'Room Service',
    concierge: 'Concierge',
    'ski-in/ski-out': 'Ski-in/Ski-out',
    'hot tub': 'Hot Tub',
    fireplace: 'Fireplace',
    'ski storage': 'Ski Storage',
    'shuttle service': 'Shuttle Service',
    'airport shuttle': 'Airport Shuttle',
    'valet parking': 'Valet Parking',
    bar: 'Bar',
    'infinity pool': 'Infinity Pool',
    'rooftop bar': 'Rooftop Bar',
    'business center': 'Business Center',
    'kids club': 'Kids Club',
  };
  return labels[amenity.toLowerCase()] ?? amenity;
}