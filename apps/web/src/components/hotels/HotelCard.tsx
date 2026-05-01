import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AmenityIcon, getAmenityLabel } from './AmenityIcon';
import type { HotelSearchResult } from '@/types/hotel';

interface HotelCardProps {
  hotel: HotelSearchResult;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const displayedAmenities = hotel.amenities.slice(0, 4);

  return (
    <Card className="overflow-hidden">
      {/* Image carousel */}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {hotel.images.slice(0, 3).map((img, i) => (
              <div key={i} className="flex-[0_0_100%]">
                <img
                  src={img}
                  alt={`${hotel.name} - Image ${i + 1}`}
                  className="h-48 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Navigation arrows */}
        {hotel.images.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 hover:bg-white"
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 hover:bg-white"
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </>
        )}
        {/* Dots indicator */}
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {hotel.images.slice(0, 3).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/60" />
          ))}
        </div>
      </div>

      <CardContent className="flex flex-col gap-2 p-4">
        {/* Hotel name */}
        <Link
          to={`/hotels/${hotel.id}`}
          className="font-semibold text-lg leading-tight hover:underline"
        >
          {hotel.name}
        </Link>

        {/* Star rating + city */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < (hotel.starRating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`}
              />
            ))}
          </div>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {hotel.city}, {hotel.country}
          </span>
        </div>

        {/* Price */}
        <p className="text-sm font-medium">
          from <span className="text-lg font-bold">${hotel.cheapestRoomPrice}</span>{' '}
          <span className="text-muted-foreground">/ night</span>
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {displayedAmenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              <AmenityIcon amenity={amenity} className="mr-1 h-3 w-3" />
              {getAmenityLabel(amenity)}
            </Badge>
          ))}
        </div>

        {/* CTA */}
        <Button asChild className="mt-2 w-full">
          <Link to={`/hotels/${hotel.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}