import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Phone, MapPin, Users, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getBooking } from '@/services/api';
import type { BookingDetail } from '@/types/booking';
import { BookingStatus } from '@hotel/shared';

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function generateBookingReference(bookingId: string): string {
  const year = new Date().getFullYear();
  // Extract numeric portion from booking ID, or generate 7-digit number
  const numericPart = bookingId.replace(/\D/g, '').slice(0, 7).padStart(7, '0');
  return `HR-${year}-${numericPart}`;
}

function generateICSFile(
  checkIn: Date | string,
  checkOut: Date | string,
  hotelName: string,
  address: string
): string {
  const formatICSDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatICSDate(checkIn)}
DTEND:${formatICSDate(checkOut)}
SUMMARY:Hotel Booking - ${hotelName}
LOCATION:${address}
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

function downloadICSFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface SuccessBannerProps {
  booking: BookingDetail;
}

function SuccessBanner({ booking }: SuccessBannerProps) {
  const reference = generateBookingReference(booking.id);

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-12 text-center text-white">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white">
        <div className="animate-bounce-subtle">
          <Check className="h-12 w-12 text-green-500" strokeWidth={3} />
        </div>
      </div>
      <h1 className="mb-2 text-3xl font-bold">Booking Confirmed!</h1>
      <p className="text-lg text-green-100">Your reservation has been successfully processed</p>
      <Badge className="mt-4 bg-white/20 text-white hover:bg-white/30">
        {reference}
      </Badge>
    </div>
  );
}

interface HotelInfoCardProps {
  booking: BookingDetail;
}

function HotelInfoCard({ booking }: HotelInfoCardProps) {
  const hotel = booking.room.hotel;
  const hotelImage = hotel.images[0] || 'https://placehold.co/600x400?text=Hotel';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hotel Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row">
          <img
            src={hotelImage}
            alt={hotel.name}
            className="h-32 w-full rounded-lg object-cover md:w-48"
          />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg">{hotel.name}</h3>
              <p className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-3 w-3" />
                {hotel.address}, {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Check-in:</span> 3:00 PM
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Contact:</span> Contact hotel for inquiries
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BookingDetailsCardProps {
  booking: BookingDetail;
}

function BookingDetailsCard({ booking }: BookingDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Check-in</p>
            <p className="font-medium">{formatDate(booking.checkIn)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check-out</p>
            <p className="font-medium">{formatDate(booking.checkOut)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{booking.numberOfGuests} Guest(s)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Room: {booking.room.type}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Price</span>
            <span className="text-xl font-bold">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: booking, isLoading, error } = useQuery<BookingDetail, Error>({
    queryKey: ['booking', id],
    queryFn: () => getBooking(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (booking) {
      // Only CONFIRMED status allows viewing confirmation page
      if (booking.status !== BookingStatus.CONFIRMED) {
        toast.error('Booking not found or not confirmed');
        navigate('/my-bookings');
      }
    }
  }, [booking, navigate]);

  const handleAddToCalendar = () => {
    if (!booking) return;

    const hotel = booking.room.hotel;
    const icsContent = generateICSFile(
      booking.checkIn,
      booking.checkOut,
      hotel.name,
      `${hotel.address}, ${hotel.city}, ${hotel.country}`
    );
    const reference = generateBookingReference(booking.id);
    downloadICSFile(icsContent, `hotel-booking-${reference}.ics`);
    toast.success('Calendar event downloaded!');
  };

  const handleViewMyBookings = () => {
    navigate('/my-bookings');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold">Booking not found</h2>
        <p className="mt-2 text-muted-foreground">
          This booking may not exist or you don't have permission to view it.
        </p>
        <Button className="mt-4" onClick={handleViewMyBookings}>
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-8">
      <SuccessBanner booking={booking} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <HotelInfoCard booking={booking} />
          <BookingDetailsCard booking={booking} />
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button onClick={handleAddToCalendar} className="flex-1 gap-2">
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </Button>
          <Button variant="outline" onClick={handleViewMyBookings} className="flex-1">
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPage;