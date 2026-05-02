import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Share, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getHotelProfile, getHotelReviews, canWriteReview } from '@/services/api';
import { AmenityIcon, getAmenityLabel } from '@/components/hotels/AmenityIcon';
import { ImageGallery } from '@/components/hotels/ImageGallery';
import { RoomTable } from '@/components/hotels/RoomTable';
import { ReviewSummary } from '@/components/hotels/ReviewSummary';
import { ReviewList } from '@/components/hotels/ReviewList';
import { StickyBookingBar } from '@/components/hotels/StickyBookingBar';

// Inline hotel detail type
interface HotelDetail {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  starRating: number | null;
  amenities: string[];
  images: string[];
  averageRating: number | null;
  createdAt: string;
}

interface ReviewRatingSummary {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const checkIn = searchParams.get('checkIn') ?? undefined;
  const checkOut = searchParams.get('checkOut') ?? undefined;
  const guests = Number(searchParams.get('guests') ?? 1);

  // Fetch hotel details
  const { data: hotel, isLoading: hotelLoading } = useQuery<HotelDetail>({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const profile = await getHotelProfile(id!);
      const reviews = await getHotelReviews(id!);
      const avgRating = reviews.total > 0
        ? reviews.reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.total
        : null;
      return {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        address: profile.address,
        city: profile.city,
        country: profile.country,
        starRating: profile.starRating,
        amenities: profile.amenities,
        images: profile.images,
        averageRating: avgRating,
        createdAt: '',
      } as HotelDetail;
    },
    enabled: !!id,
  });

  // Fetch reviews for rating summary
  const { data: reviewsData } = useQuery({
    queryKey: ['hotel-reviews', id],
    queryFn: async () => {
      const data = await getHotelReviews(id!);
      return { reviews: data.reviews, total: data.total };
    },
    enabled: !!id,
  });

  // Fetch can-review eligibility
  const { data: canReviewData } = useQuery({
    queryKey: ['can-review', id],
    queryFn: async () => {
      const data = await canWriteReview(id!);
      return data;
    },
    enabled: !!id,
  });

  // Compute rating breakdown
  const ratingBreakdown: ReviewRatingSummary = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = reviewsData?.total ?? 0;
  reviewsData?.reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, r.rating)) as 1 | 2 | 3 | 4 | 5;
    ratingBreakdown[star]++;
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'Hotel saved!');
  };

  const handleViewRooms = () => {
    document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (hotelLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-80 w-full" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Hotel not found</h2>
        <p className="mt-2 text-muted-foreground">This hotel may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Image gallery */}
        <ImageGallery images={hotel.images} hotelName={hotel.name} />

        {/* Header */}
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                {hotel.starRating && (
                  <span className="flex">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </span>
                )}
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare} title="Share">
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant={saved ? 'secondary' : 'outline'}
                size="icon"
                onClick={handleSave}
                title={saved ? 'Remove from saved' : 'Save'}
              >
                <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Description */}
        {hotel.description && (
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">About</h2>
            <p className={`text-muted-foreground leading-relaxed ${!descExpanded && 'line-clamp-3'}`}>
              {hotel.description}
            </p>
            {hotel.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-1 gap-1"
              >
                {descExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-xl font-semibold">Amenities</h2>
            <div className="flex flex-wrap gap-4">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <AmenityIcon amenity={amenity} className="h-5 w-5 text-primary" />
                  <span className="text-sm">{getAmenityLabel(amenity)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Rooms */}
        <div id="rooms-section" className="mb-6">
          <h2 className="mb-4 text-xl font-semibold">Select a Room</h2>
          <RoomTable
            hotelId={hotel.id}
            hotelName={hotel.name}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
          />
        </div>

        <Separator className="my-6" />

        {/* Reviews */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Guest Reviews</h2>
          <ReviewSummary
            averageRating={hotel.averageRating}
            totalReviews={totalReviews}
            ratingBreakdown={totalReviews > 0 ? ratingBreakdown : undefined}
          />
          <div className="mt-6">
            <ReviewList hotelId={hotel.id} />
          </div>
          {canReviewData?.canReview && (
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  toast.info('Review form coming soon!');
                }}
              >
                Write a Review
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky bar */}
      <StickyBookingBar
        hotelName={hotel.name}
        cheapestPrice={0}
        onViewRooms={handleViewRooms}
      />
    </div>
  );
}