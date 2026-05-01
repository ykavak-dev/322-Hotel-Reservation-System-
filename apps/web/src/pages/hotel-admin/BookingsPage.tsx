// apps/web/src/pages/hotel-admin/BookingsPage.tsx
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getHotelAdminBookings, confirmBooking, cancelBookingAdmin } from '../../services/api';
import { BookingFilters } from '../../components/hotel-admin/BookingFilters';
import { BookingsTable } from '../../components/hotel-admin/BookingsTable';
import type { AdminBooking, BookingFilters as BookingFiltersType } from '../../types/admin';
import { toast } from 'sonner';

export const BookingsPage: React.FC = () => {
  const [filters, setFilters] = useState<BookingFiltersType>({ status: 'ALL', page: 1, limit: 50 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['hotel-admin-bookings', filters],
    queryFn: () => getHotelAdminBookings(filters),
    refetchInterval: 30000,
  });

  const bulkConfirmMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(confirmBooking)),
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} bookings confirmed`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] });
    },
    onError: () => toast.error('Bulk confirm failed'),
  });

  const bulkCancelMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(cancelBookingAdmin)),
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} bookings cancelled`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] });
    },
    onError: () => toast.error('Bulk cancel failed'),
  });

  const exportCSV = useCallback(() => {
    if (!data?.bookings) return;
    const rows = [
      'Booking Ref,Guest Name,Email,Room Type,Check-in,Check-out,Nights,Total,Status',
      ...data.bookings.map((b: AdminBooking) => {
        const nights = Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / (1000 * 60 * 60 * 24));
        return [
          b.id.slice(0, 8).toUpperCase(),
          `${b.user?.firstName} ${b.user?.lastName}`,
          b.user?.email ?? '',
          b.room.type,
          format(new Date(b.checkIn), 'yyyy-MM-dd'),
          format(new Date(b.checkOut), 'yyyy-MM-dd'),
          nights,
          Number(b.totalPrice),
          b.status,
        ].join(',');
      }),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotel-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookings</h2>
        <p className="text-sm text-muted-foreground">Manage all bookings across your hotels</p>
      </div>

      <BookingFilters
        filters={filters}
        onChange={setFilters}
        onExportCSV={exportCSV}
        hasSelectedRows={selectedIds.size > 0}
        onBulkConfirm={() => bulkConfirmMutation.mutate([...selectedIds])}
        onBulkCancel={() => bulkCancelMutation.mutate([...selectedIds])}
      />

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <BookingsTable
          bookings={data?.bookings ?? []}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
};