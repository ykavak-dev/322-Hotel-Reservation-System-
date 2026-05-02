// apps/web/src/pages/admin/SystemBookingsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { StatusBadge } from '../../components/hotel-admin/StatusBadge';
import { ConfirmationAlert } from '../../components/hotel-admin/ConfirmationAlert';
import { getSystemBookings, refundBooking } from '../../services/api';
import type { BookingStatus } from '../../types/systemAdmin';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

export const SystemBookingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['system-admin-bookings', page, search, statusFilter, dateFrom, dateTo, priceMin, priceMax],
    queryFn: () => getSystemBookings({
      page,
      limit: 20,
      search: search || undefined,
      status: statusFilter === 'ALL' ? undefined : statusFilter as BookingStatus,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    }),
  });

  const refundMutation = useMutation({
    mutationFn: (bookingId: string) => refundBooking(bookingId),
    onSuccess: () => {
      toast.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['system-admin-bookings'] });
    },
    onError: () => toast.error('Failed to process refund'),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Bookings</CardTitle>
          <CardDescription>View and manage all bookings across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Booking ID, guest name..."
                  className="pl-9 w-48"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">From Date</label>
              <Input type="date" className="w-36" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">To Date</label>
              <Input type="date" className="w-36" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Min Price</label>
              <Input
                type="number"
                placeholder="$0"
                className="w-28"
                value={priceMin}
                onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Max Price</label>
              <Input
                type="number"
                placeholder="$9999"
                className="w-28"
                value={priceMax}
                onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
              />
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setDateFrom('');
                setDateTo('');
                setPriceMin('');
                setPriceMax('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ref</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guest</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hotel</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dates</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guests</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.bookings.map((booking) => {
                    const paidPayment = booking.payments.find((p) => p.status === 'PAID');
                    return (
                      <tr key={booking.id} className="border-t hover:bg-muted/30">
                        <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-3 px-4">
                          <div>{booking.user.firstName} {booking.user.lastName}</div>
                          <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{booking.room.hotel.name}</div>
                          <div className="text-xs text-muted-foreground">{booking.room.hotel.city}, {booking.room.hotel.country}</div>
                        </td>
                        <td className="py-3 px-4">{booking.room.type}</td>
                        <td className="py-3 px-4">
                          <div>{format(new Date(booking.checkIn), 'MMM d')} → {format(new Date(booking.checkOut), 'MMM d')}</div>
                        </td>
                        <td className="py-3 px-4 text-center">{booking.numberOfGuests}</td>
                        <td className="py-3 px-4 font-medium">${booking.totalPrice.toLocaleString()}</td>
                        <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                        <td className="py-3 px-4">
                          {paidPayment ? (
                            <Badge className="bg-green-100 text-green-800">Paid</Badge>
                          ) : (
                            <Badge variant="outline">{booking.payments[0]?.status ?? 'None'}</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {paidPayment && (
                            <ConfirmationAlert
                              title="Refund Booking"
                              description={`Process full refund of $${paidPayment.amount.toLocaleString()} for this booking?`}
                              confirmLabel="Refund"
                              variant="destructive"
                              onConfirm={() => refundMutation.mutate(booking.id)}
                            >
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <RotateCcw className="h-3 w-3 mr-1" /> Refund
                              </Button>
                            </ConfirmationAlert>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {data?.bookings.length === 0 && (
                    <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">No bookings found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} bookings
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={page === data.totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
