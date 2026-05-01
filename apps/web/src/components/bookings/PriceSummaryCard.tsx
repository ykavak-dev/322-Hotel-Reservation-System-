import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/auth/LoadingSpinner';
import { cn } from '@/lib/utils';

interface PriceSummaryCardProps {
  pricePerNight: number;
  nights: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  className?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const PriceSummaryCard: React.FC<PriceSummaryCardProps> = ({
  pricePerNight,
  nights,
  isSubmitting,
  onConfirm,
  className,
}) => {
  const roomTotal = pricePerNight * nights;
  const taxes = roomTotal * 0.12;
  const total = roomTotal + taxes;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner /> : 'Confirm Booking'}
        </Button>
      </CardContent>
    </Card>
  );
};
