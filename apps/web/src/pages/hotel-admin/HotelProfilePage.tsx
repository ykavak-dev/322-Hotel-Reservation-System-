// apps/web/src/pages/hotel-admin/HotelProfilePage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ImageGalleryManager } from '../../components/hotel-admin/ImageGalleryManager';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getHotelProfile, updateHotelProfile } from '../../services/api';

// TODO: Replace with actual hotel ID from auth context
const MOCK_HOTEL_ID = 'mock-hotel-id';

const AMENITIES_OPTIONS = [
  'WiFi', 'Pool', 'Parking', 'Air Conditioning', 'TV', 'Mini Bar',
  'Safe', 'Balcony', 'Ocean View', 'Smoking Allowed', 'Room Service',
  'Gym', 'Spa', 'Pet Friendly', 'Beach Access', 'Airport Shuttle',
];

export const HotelProfilePage: React.FC = () => {
  const hotelId = MOCK_HOTEL_ID;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    starRating: 0,
    amenities: [] as string[],
    images: [] as string[],
  });

  const [starRatingHover, setStarRatingHover] = useState(0);

  const { data: hotel } = useQuery({
    queryKey: ['hotel-profile', hotelId],
    queryFn: () => getHotelProfile(hotelId),
    enabled: hotelId !== MOCK_HOTEL_ID,
  });

  useEffect(() => {
    if (hotel) {
      setForm({
        name: hotel.name,
        description: hotel.description ?? '',
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        starRating: hotel.starRating ?? 0,
        amenities: hotel.amenities,
        images: hotel.images,
      });
    }
  }, [hotel]);

  const mutation = useMutation({
    mutationFn: () => updateHotelProfile(hotelId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-profile', hotelId] });
      toast.success('Hotel profile updated');
    },
    onError: () => toast.error('Failed to update hotel profile'),
  });

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Hotel Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your hotel information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your hotel details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Hotel Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hotel name" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your hotel..." />
            </div>
            <div className="grid gap-2">
              <Label>Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Country *</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Star Rating</CardTitle>
          <CardDescription>Click to set your hotel's star rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, starRating: star })}
                onMouseEnter={() => setStarRatingHover(star)}
                onMouseLeave={() => setStarRatingHover(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    star <= (starRatingHover || form.starRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Select the amenities your hotel offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  id={`profile-amenity-${amenity}`}
                  checked={form.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={`profile-amenity-${amenity}`} className="text-sm font-normal cursor-pointer">{amenity}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Add image URLs for your hotel gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGalleryManager
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          {hotel?.isVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium dark:bg-green-900/30 dark:text-green-400">
                Verified Hotel
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium dark:bg-yellow-900/30 dark:text-yellow-400">
                Not Yet Verified
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || hotelId === MOCK_HOTEL_ID}
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};