import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { paymentSchema, type PaymentFormData } from '@/lib/validations/bookingSchemas';
import { getBooking, processPayment } from '@/services/api';
import type { BookingDetail } from '@/types/booking';

// Credit card formatting helpers
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

function maskCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

// Generate mock card token
function generateCardToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return btoa(token);
}

type PaymentState = 'default' | 'loading' | 'success' | 'failure';

function SecurePaymentHeader() {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Lock className="h-5 w-5 text-green-600" />
      <h1 className="text-2xl font-semibold">Secure Payment</h1>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Separator />
        <Skeleton className="h-6 w-1/3" />
      </CardContent>
    </Card>
  );
}

interface OrderSummaryProps {
  booking: BookingDetail;
}

function OrderSummary({ booking }: OrderSummaryProps) {
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">{booking.room.hotel.name}</p>
          <p className="text-sm text-muted-foreground">{booking.room.hotel.address}</p>
        </div>
        <Separator />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-in</span>
            <span>{checkIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Check-out</span>
            <span>{checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Guests</span>
            <span>{booking.numberOfGuests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Room</span>
            <span>{booking.room.type}</span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${booking.totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreditCardFormProps {
  control: ReturnType<typeof useForm<PaymentFormData>>['control'];
  paymentState: PaymentState;
}

function CreditCardForm({ control, paymentState }: CreditCardFormProps) {
  const isDisabled = paymentState === 'loading' || paymentState === 'success';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Credit Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  disabled={isDisabled}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="cardExpiry"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry (MM/YY)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    disabled={isDisabled}
                    onChange={(e) => {
                      const formatted = formatExpiry(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="cvv"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>CVV</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    inputMode="numeric"
                    placeholder="123"
                    disabled={isDisabled}
                    onChange={(e) => {
                      const masked = maskCVV(e.target.value);
                      field.onChange(masked);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="cardholderName"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="John Doe"
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

interface BillingAddressFormProps {
  control: ReturnType<typeof useForm<PaymentFormData>>['control'];
  paymentState: PaymentState;
}

function BillingAddressForm({ control, paymentState }: BillingAddressFormProps) {
  const isDisabled = paymentState === 'loading' || paymentState === 'success';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Billing Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          name="billingAddress.street"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="123 Main St"
                  disabled={isDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="billingAddress.city"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="New York"
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="billingAddress.state"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="NY"
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="billingAddress.zip"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    inputMode="numeric"
                    placeholder="10001"
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="billingAddress.country"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="United States"
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [paymentState, setPaymentState] = useState<PaymentState>('default');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: booking, isLoading: bookingLoading } = useQuery<BookingDetail>({
    queryKey: ['booking', bookingId],
    queryFn: () => getBooking(bookingId!),
    enabled: !!bookingId,
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardExpiry: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
    },
  });

  const { handleSubmit, reset } = form;

  // Reset form on booking load if needed
  useEffect(() => {
    if (booking) {
      // Pre-fill billing address city from hotel location if available
      if (booking.room.hotel.city) {
        reset({
          cardNumber: '',
          cardExpiry: '',
          cvv: '',
          cardholderName: '',
          billingAddress: {
            street: '',
            city: booking.room.hotel.city,
            state: '',
            zip: '',
            country: booking.room.hotel.country,
          },
        });
      }
    }
  }, [booking, reset]);

  const onSubmit = async (_data: PaymentFormData) => {
    if (!bookingId) return;

    setPaymentState('loading');
    setErrorMessage('');

    // Simulate 3-second processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const cardToken = generateCardToken();
      await processPayment({
        bookingId,
        paymentMethod: 'credit_card',
        cardToken,
        idempotencyKey: bookingId,
      });

      setPaymentState('success');
      toast.success('Payment processed successfully!');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/booking-confirmation/${bookingId}`);
      }, 1500);
    } catch (error) {
      setPaymentState('failure');
      const message = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleRetry = () => {
    setPaymentState('default');
    setErrorMessage('');
    form.reset();
  };

  if (bookingLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SecurePaymentHeader />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <OrderSummarySkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Booking not found. Please check your booking details.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SecurePaymentHeader />

      {paymentState === 'success' && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-green-100 p-4 mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-green-600">Payment Successful!</h2>
          <p className="text-muted-foreground mt-2">Redirecting to your confirmation...</p>
        </div>
      )}

      {paymentState !== 'success' && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {paymentState === 'failure' && errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Left column - Forms */}
              <div className="lg:col-span-2 space-y-6">
                <CreditCardForm control={form.control} paymentState={paymentState} />
                <BillingAddressForm control={form.control} paymentState={paymentState} />
              </div>

              {/* Right column - Order summary */}
              <div>
                <OrderSummary booking={booking} />
              </div>
            </div>

            {/* Mobile sticky CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 lg:hidden">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={paymentState === 'loading'}
              >
                {paymentState === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay Now — ${booking.totalPrice.toFixed(2)}</>
                )}
              </Button>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:block">
              <Button
                type={paymentState === 'failure' ? 'button' : 'submit'}
                className="w-full"
                size="lg"
                disabled={paymentState === 'loading'}
                onClick={paymentState === 'failure' ? handleRetry : undefined}
              >
                {paymentState === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentState === 'failure' ? (
                  'Try Again'
                ) : (
                  <>Pay Now — ${booking.totalPrice.toFixed(2)}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Spacer for mobile sticky CTA */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
