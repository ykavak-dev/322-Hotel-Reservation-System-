import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FormProvider } from 'react-hook-form';

import { checkoutSchema } from '@/lib/validations/bookingSchemas';
import { createBooking } from '@/services/api';
import { queryClient } from '@/lib/api/queryClient';
import type { CreateBookingData } from '@/types/booking';

import { Breadcrumb } from '@/components/bookings/Breadcrumb';
import { BookingSummaryCard } from '@/components/bookings/BookingSummaryCard';
import { GuestDetailsForm } from '@/components/bookings/GuestDetailsForm';
import { PriceSummaryCard } from '@/components/bookings/PriceSummaryCard';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse URL params
  const roomId = searchParams.get('roomId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const guests = Number(searchParams.get('guests') ?? '1');
  const price = Number(searchParams.get('price') ?? '0');
  const hotelName = searchParams.get('hotelName') ?? '';
  const roomType = searchParams.get('roomType') ?? '';
  const hotelImage = searchParams.get('hotelImage') ?? '';

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  // Form setup
  const methods = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      isBookingForSomeoneElse: false,
      guestFirstName: '',
      guestLastName: '',
      guestEmail: '',
      guestPhone: '',
    },
  });

  const { handleSubmit } = methods;

  // Create booking mutation
  const mutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      return createBooking(data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully!');
      navigate(`/payment/${response.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.');
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!roomId || !checkIn || !checkOut) {
      toast.error('Missing booking information. Please go back and try again.');
      return;
    }

    mutation.mutate({
      roomId,
      checkIn,
      checkOut,
      numberOfGuests: guests,
      specialRequests: data.specialRequests,
    });
  });

  // Validate required params on mount
  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      toast.error('Missing booking information. Please go back and try again.');
      navigate('/hotels');
    }
  }, [roomId, checkIn, checkOut, navigate]);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: hotelName, href: `/hotels` },
                { label: roomType },
                { label: 'Booking' },
              ]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* Left column - 60% */}
            <div className="space-y-6">
              <BookingSummaryCard
                hotelImage={hotelImage}
                hotelName={hotelName}
                roomType={roomType}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                pricePerNight={price}
              />

              <GuestDetailsForm />
            </div>

            {/* Right column - 40%, sticky */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <PriceSummaryCard
                  pricePerNight={price}
                  nights={nights}
                  isSubmitting={mutation.isPending}
                  onConfirm={onSubmit}
                />
              </div>
            </div>
          </div>

          {/* Mobile price summary - bottom sticky */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 lg:hidden">
            <div className="mx-auto max-w-md">
              <PriceSummaryCard
                pricePerNight={price}
                nights={nights}
                isSubmitting={mutation.isPending}
                onConfirm={onSubmit}
              />
            </div>
          </div>

          {/* Spacer for mobile bottom bar */}
          <div className="h-24 lg:hidden" />
        </div>
      </div>
    </FormProvider>
  );
};
