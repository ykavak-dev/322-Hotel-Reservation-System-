import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface BookingSummaryCardProps {
  hotelImage: string;
  hotelName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  className?: string;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  hotelImage,
  hotelName,
  roomType,
  checkIn,
  checkOut,
  nights,
  pricePerNight,
  className,
}) => {
  const roomTotal = pricePerNight * nights;
  const taxes = roomTotal * 0.12;
  const total = roomTotal + taxes;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Booking Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hotel image and name */}
        <div className="flex gap-4">
          <img
            src={hotelImage}
            alt={hotelName}
            className="h-24 w-24 rounded-md object-cover"
          />
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold">{hotelName}</h3>
            <p className="text-sm text-muted-foreground">{roomType}</p>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Check-in</p>
            <p className="font-medium">{formatDate(checkIn)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Check-out</p>
            <p className="font-medium">{formatDate(checkOut)}</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">{nights} night{nights !== 1 ? 's' : ''}</p>

        <Separator />

        {/* Price breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {formatCurrency(pricePerNight)} x {nights} night{nights !== 1 ? 's' : ''}
            </span>
            <span>{formatCurrency(roomTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes (~12%)</span>
            <span>{formatCurrency(taxes)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
