import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, differenceInHours, isAfter, isBefore, parseISO } from 'date-fns';
import { CalendarIcon, ClockIcon, AlertTriangleIcon } from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getUserBookings, cancelBooking } from '@/services/api';
import { queryClient } from '@/lib/api/queryClient';
import type { BookingDetail } from '@/types/booking';
import { BookingStatus } from '@hotel/shared';

type BookingTab = 'upcoming' | 'past' | 'cancelled';

interface BookingCardProps {
  booking: BookingDetail;
  onCancelClick: (booking: BookingDetail) => void;
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const variants: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [BookingStatus.PENDING]: 'default',
    [BookingStatus.CONFIRMED]: 'secondary',
    [BookingStatus.CANCELLED]: 'destructive',
    [BookingStatus.COMPLETED]: 'outline',
    [BookingStatus.NO_SHOW]: 'destructive',
  };

  const labels: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Pending',
    [BookingStatus.CONFIRMED]: 'Confirmed',
    [BookingStatus.CANCELLED]: 'Cancelled',
    [BookingStatus.COMPLETED]: 'Completed',
    [BookingStatus.NO_SHOW]: 'No Show',
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

function BookingCard({ booking, onCancelClick }: BookingCardProps) {
  const navigate = useNavigate();

  const checkInDate = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : booking.checkIn;
  const checkOutDate = typeof booking.checkOut === 'string' ? parseISO(booking.checkOut) : booking.checkOut;
  const today = new Date();

  const canCancel =
    booking.status === BookingStatus.CONFIRMED &&
    differenceInHours(checkInDate, today) > 24;

  const imageUrl = booking.room.images?.[0]
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099940?w=400&h=300&fit=crop';

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-48 sm:h-32">
          <img
            src={imageUrl}
            alt={booking.room.hotel.name}
            className="h-40 w-full object-cover sm:h-full sm:w-48"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{booking.room.hotel.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(checkInDate, 'MMM dd')} - {format(checkOutDate, 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <ClockIcon className="h-4 w-4" />
                <span>{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
              </div>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-3">
            <span className="text-lg font-bold">
              ${booking.totalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground"> total</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/booking-confirmation/${booking.id}`)}
            >
              View Details
            </Button>
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancelClick(booking)}
              >
                Cancel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/hotels/${booking.room.hotel.id}`)}
            >
              Book Again
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function EmptyState({ type }: { type: BookingTab }) {
  const messages: Record<BookingTab, { title: string; description: string }> = {
    upcoming: {
      title: 'No upcoming bookings',
      description: 'Your future reservations will appear here.',
    },
    past: {
      title: 'No past bookings',
      description: 'Your completed stays will appear here.',
    },
    cancelled: {
      title: 'No cancelled bookings',
      description: 'Cancelled reservations will appear here.',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <CalendarIcon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg">{messages[type].title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{messages[type].description}</p>
    </div>
  );
}

function CancellationModal({
  booking,
  open,
  onOpenChange,
  onConfirm,
}: {
  booking: BookingDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!booking) return null;

  const checkInDate = typeof booking.checkIn === 'string' ? parseISO(booking.checkIn) : booking.checkIn;
  const hoursUntilCheckIn = differenceInHours(checkInDate, new Date());

  let refundMessage: string;
  if (hoursUntilCheckIn >= 48) {
    refundMessage = 'You will receive a full refund.';
  } else if (hoursUntilCheckIn >= 24) {
    refundMessage = 'You will receive a 50% refund.';
  } else {
    refundMessage = 'No refund will be issued (less than 24 hours before check-in).';
  }

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            <DialogTitle>Cancel Booking</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel this booking?
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{refundMessage}</AlertDescription>
        </Alert>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConfirming}
          >
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BookingSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="sm:w-48 sm:h-32 h-40 w-full" />
        <CardContent className="flex-1 p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-20" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelBookingData, setCancelBookingData] = useState<BookingDetail | null>(null);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const today = new Date();

  const upcomingBookings = bookings.filter((b) => {
    const checkOut = typeof b.checkOut === 'string' ? parseISO(b.checkOut) : b.checkOut;
    const isFuture = isAfter(checkOut, today);
    const isPendingOrConfirmed = b.status === BookingStatus.PENDING || b.status === BookingStatus.CONFIRMED;
    return isFuture && isPendingOrConfirmed;
  });

  const pastBookings = bookings.filter((b) => {
    const checkOut = typeof b.checkOut === 'string' ? parseISO(b.checkOut) : b.checkOut;
    const isPast = isBefore(checkOut, today) || isBefore(checkOut, today);
    return isPast || b.status === BookingStatus.COMPLETED;
  });

  const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED);

  const handleCancelClick = (booking: BookingDetail) => {
    setCancelBookingData(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingData) return;

    try {
      await cancelBooking(cancelBookingData.id);
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully.');
      await fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelBookingData(null);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-1">
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {isLoading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : upcomingBookings.length === 0 ? (
            <EmptyState type="upcoming" />
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={handleCancelClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {isLoading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : pastBookings.length === 0 ? (
            <EmptyState type="past" />
          ) : (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={handleCancelClick}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-4">
          {isLoading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : cancelledBookings.length === 0 ? (
            <EmptyState type="cancelled" />
          ) : (
            cancelledBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelClick={handleCancelClick}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <CancellationModal
        booking={cancelBookingData}
        open={cancelBookingData !== null}
        onOpenChange={(open) => !open && setCancelBookingData(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}

export default MyBookingsPage;
