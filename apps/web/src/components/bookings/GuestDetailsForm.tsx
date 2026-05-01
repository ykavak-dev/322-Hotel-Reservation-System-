import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { CheckoutFormData } from '@/lib/validations/bookingSchemas';
import { cn } from '@/lib/utils';

interface GuestDetailsFormProps {
  className?: string;
}

export const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  className,
}) => {
  const { register, watch, formState: { errors } } = useFormContext<CheckoutFormData>();

  const isBookingForSomeoneElse = watch('isBookingForSomeoneElse');

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Guest Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {/* Main guest fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or preferences..."
              rows={3}
              {...register('specialRequests')}
              aria-invalid={!!errors.specialRequests}
            />
            {errors.specialRequests && (
              <p className="text-sm text-destructive">{errors.specialRequests.message}</p>
            )}
          </div>

          {/* Booking for someone else checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isBookingForSomeoneElse"
              {...register('isBookingForSomeoneElse')}
            />
            <Label htmlFor="isBookingForSomeoneElse" className="text-sm font-normal cursor-pointer">
              I'm booking for someone else
            </Label>
          </div>

          {/* Extra guest fields when checked */}
          {isBookingForSomeoneElse && (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Guest Information</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guestFirstName">Guest First Name</Label>
                  <Input
                    id="guestFirstName"
                    placeholder="Jane"
                    {...register('guestFirstName')}
                    aria-invalid={!!errors.guestFirstName}
                  />
                  {errors.guestFirstName && (
                    <p className="text-sm text-destructive">{errors.guestFirstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestLastName">Guest Last Name</Label>
                  <Input
                    id="guestLastName"
                    placeholder="Doe"
                    {...register('guestLastName')}
                    aria-invalid={!!errors.guestLastName}
                  />
                  {errors.guestLastName && (
                    <p className="text-sm text-destructive">{errors.guestLastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestEmail">Guest Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="jane.doe@example.com"
                  {...register('guestEmail')}
                  aria-invalid={!!errors.guestEmail}
                />
                {errors.guestEmail && (
                  <p className="text-sm text-destructive">{errors.guestEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guestPhone">Guest Phone</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('guestPhone')}
                  aria-invalid={!!errors.guestPhone}
                />
                {errors.guestPhone && (
                  <p className="text-sm text-destructive">{errors.guestPhone.message}</p>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
