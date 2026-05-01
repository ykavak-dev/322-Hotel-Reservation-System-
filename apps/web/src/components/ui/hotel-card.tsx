import { Star, MapPin } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
}

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
        <Badge className="absolute top-3 right-3 bg-[#3B82F6]">Featured</Badge>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-[#1E3A5F]">{hotel.name}</h3>
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          {hotel.location}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-medium">{hotel.rating}</span>
          </div>
          <span className="text-gray-400">({hotel.reviews} reviews)</span>
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#3B82F6]">${hotel.price}</span>
          <span className="text-gray-500">/night</span>
        </div>
      </div>
    </Card>
  );
}