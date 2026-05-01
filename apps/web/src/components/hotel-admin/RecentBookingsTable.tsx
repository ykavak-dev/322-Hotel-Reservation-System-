// apps/web/src/components/hotel-admin/RecentBookingsTable.tsx
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import type { AdminRecentBooking } from '../../types/admin';

interface RecentBookingsTableProps {
  bookings: AdminRecentBooking[];
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ bookings }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ref</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guest</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Room</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Check-in</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Check-out</th>
            <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-2 font-mono text-xs">{b.id.slice(0, 8).toUpperCase()}</td>
              <td className="py-3 px-2">{b.guestEmail}</td>
              <td className="py-3 px-2">{b.roomType}</td>
              <td className="py-3 px-2">{format(new Date(b.checkIn), 'MMM d, yyyy')}</td>
              <td className="py-3 px-2">{format(new Date(b.checkOut), 'MMM d, yyyy')}</td>
              <td className="py-3 px-2"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-muted-foreground">No recent bookings</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};