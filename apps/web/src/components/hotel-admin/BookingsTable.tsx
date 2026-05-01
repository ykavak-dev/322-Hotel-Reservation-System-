// apps/web/src/components/hotel-admin/BookingsTable.tsx
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ConfirmationAlert } from './ConfirmationAlert';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { cn } from '../../lib/utils';
import type { AdminBooking } from '../../types/admin';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { confirmBooking, checkInBooking, cancelBookingAdmin } from '../../services/api';

interface BookingsTableProps {
  bookings: AdminBooking[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  selectedIds,
  onSelectionChange,
}) => {
  const queryClient = useQueryClient();

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === bookings.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(bookings.map((b) => b.id)));
    }
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="py-3 px-4 text-left">
              <Checkbox checked={selectedIds.size === bookings.length && bookings.length > 0} onCheckedChange={toggleSelectAll} />
            </th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ref</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guest</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dates</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nights</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className={cn('border-t hover:bg-muted/30', selectedIds.has(booking.id) && 'bg-primary/5')}>
              <td className="py-3 px-4">
                <Checkbox checked={selectedIds.has(booking.id)} onCheckedChange={() => toggleSelect(booking.id)} />
              </td>
              <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8).toUpperCase()}</td>
              <td className="py-3 px-4">
                <div>{booking.user?.firstName} {booking.user?.lastName}</div>
                <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
              </td>
              <td className="py-3 px-4">{booking.room.type}</td>
              <td className="py-3 px-4">
                <div>{format(new Date(booking.checkIn), 'MMM d')} → {format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
              </td>
              <td className="py-3 px-4">{calculateNights(booking.checkIn, booking.checkOut)}</td>
              <td className="py-3 px-4 font-medium">${Number(booking.totalPrice).toLocaleString()}</td>
              <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
              <td className="py-3 px-4">
                <div className="flex gap-2 flex-wrap">
                  {booking.status === 'PENDING' && (
                    <>
                      <ConfirmationAlert
                        title="Confirm Booking"
                        description="This will confirm the booking. The guest will be notified."
                        confirmLabel="Confirm"
                        onConfirm={() => confirmBooking(booking.id).then(() => { toast.success('Booking confirmed'); queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] }); }).catch(() => toast.error('Failed to confirm'))}
                      >
                        <Button size="sm" variant="outline"><Check className="h-3 w-3 mr-1" /> Confirm</Button>
                      </ConfirmationAlert>
                      <ConfirmationAlert
                        title="Cancel Booking"
                        description="This will cancel the booking."
                        confirmLabel="Cancel"
                        variant="destructive"
                        onConfirm={() => cancelBookingAdmin(booking.id).then(() => { toast.success('Booking cancelled'); queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] }); }).catch(() => toast.error('Failed to cancel'))}
                      >
                        <Button size="sm" variant="ghost" className="text-destructive"><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </ConfirmationAlert>
                    </>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <>
                      <ConfirmationAlert
                        title="Check-in Guest"
                        description="This will mark the guest as checked in."
                        confirmLabel="Check-in"
                        onConfirm={() => checkInBooking(booking.id).then(() => { toast.success('Checked in'); queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] }); }).catch(() => toast.error('Failed to check in'))}
                      >
                        <Button size="sm" variant="outline"><Check className="h-3 w-3 mr-1" /> Check-in</Button>
                      </ConfirmationAlert>
                      <ConfirmationAlert
                        title="Cancel Booking"
                        description="This will cancel the booking."
                        confirmLabel="Cancel"
                        variant="destructive"
                        onConfirm={() => cancelBookingAdmin(booking.id).then(() => { toast.success('Booking cancelled'); queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] }); }).catch(() => toast.error('Failed to cancel'))}
                      >
                        <Button size="sm" variant="ghost" className="text-destructive"><X className="h-3 w-3 mr-1" /> Cancel</Button>
                      </ConfirmationAlert>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr><td colSpan={9} className="py-8 text-center text-muted-foreground">No bookings found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};