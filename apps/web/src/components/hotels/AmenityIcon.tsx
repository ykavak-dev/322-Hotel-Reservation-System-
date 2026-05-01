import {
  Wifi,
  Waves,
  ParkingCircle,
  Sparkles,
  Coffee,
  Dumbbell,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const AMENITY_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  parking: ParkingCircle,
  spa: Sparkles,
  breakfast: Coffee,
  gym: Dumbbell,
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
    pool: 'Pool',
    parking: 'Parking',
    spa: 'Spa',
    breakfast: 'Breakfast',
    gym: 'Gym',
  };
  return labels[amenity.toLowerCase()] ?? amenity;
}