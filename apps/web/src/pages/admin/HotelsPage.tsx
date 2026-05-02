// apps/web/src/pages/admin/HotelsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, CheckCircle, XCircle, Eye, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ConfirmationAlert } from '../../components/hotel-admin/ConfirmationAlert';
import { getPendingHotels, getAllHotels, approveHotel, rejectHotel, getHotelDetail } from '../../services/api';
import type { AdminHotelItem } from '../../types/systemAdmin';
import { cn } from '../../lib/utils';

export const HotelsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Pending tab
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['system-admin-hotels-pending'],
    queryFn: getPendingHotels,
  });

  // All hotels tab
  const [allPage, setAllPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'verified' | 'pending' | 'rejected' | ''>('');

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['system-admin-hotels-all', allPage, search, statusFilter],
    queryFn: () => getAllHotels({
      page: allPage,
      limit: 20,
      verificationStatus: statusFilter || undefined,
      search: search || undefined,
    }),
  });

  // Detail modal
  const [selectedHotel, setSelectedHotel] = useState<AdminHotelItem | null>(null);

  // Reject modal
  const [rejectHotelId, setRejectHotelId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const approveMutation = useMutation({
    mutationFn: (hotelId: string) => approveHotel(hotelId),
    onSuccess: () => {
      toast.success('Hotel approved');
      queryClient.invalidateQueries({ queryKey: ['system-admin-hotels-pending'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin-hotels-all'] });
    },
    onError: () => toast.error('Failed to approve hotel'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ hotelId, reason }: { hotelId: string; reason: string }) => rejectHotel(hotelId, reason),
    onSuccess: () => {
      toast.success('Hotel rejected');
      queryClient.invalidateQueries({ queryKey: ['system-admin-hotels-pending'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin-hotels-all'] });
      setRejectHotelId(null);
      setRejectReason('');
    },
    onError: () => toast.error('Failed to reject hotel'),
  });

  const detailMutation = useMutation({
    mutationFn: (hotelId: string) => getHotelDetail(hotelId),
    onSuccess: (data) => setSelectedHotel(data),
    onError: () => toast.error('Failed to load hotel details'),
  });

  const handleViewDetail = (hotelId: string) => {
    detailMutation.mutate(hotelId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Verification
            {pendingData && pendingData.hotels.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingData.hotels.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Hotels</TabsTrigger>
        </TabsList>

        {/* Pending Verification Tab */}
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Hotel Verifications</CardTitle>
              <CardDescription>Hotels awaiting review before going live</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
              ) : pendingData?.hotels.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No pending verifications. All caught up!
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingData?.hotels.map((hotel) => (
                    <div key={hotel.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{hotel.name}</h3>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {hotel.city}, {hotel.country}
                          </div>
                          <p className="text-sm mt-2 line-clamp-2">{hotel.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground">Owner: {hotel.owner.firstName} {hotel.owner.lastName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{hotel.owner.email}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">Submitted {format(new Date(hotel.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(hotel.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> Details
                          </Button>
                          <ConfirmationAlert
                            title="Approve Hotel"
                            description={`Approve "${hotel.name}" to go live?`}
                            confirmLabel="Approve"
                            onConfirm={() => approveMutation.mutate(hotel.id)}
                          >
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                          </ConfirmationAlert>
                          <ConfirmationAlert
                            title="Reject Hotel"
                            description={`Are you sure you want to reject "${hotel.name}"?`}
                            confirmLabel="Reject"
                            variant="destructive"
                            onConfirm={() => {
                              setRejectHotelId(hotel.id);
                              setRejectReason('');
                            }}
                          >
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </ConfirmationAlert>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Hotels Tab */}
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Hotels</CardTitle>
              <CardDescription>Browse and filter all hotels in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap items-end gap-3 mb-6">
                <div className="grid gap-1.5">
                  <label className="text-xs text-muted-foreground">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Hotel name, city..."
                      className="pl-9 w-48"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setAllPage(1); }}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <select
                    className="flex h-9 w-40 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value as any); setAllPage(1); }}
                  >
                    <option value="">All</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {allLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Hotel</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Owner</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rooms</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allData?.hotels.map((hotel) => (
                        <tr key={hotel.id} className="border-t hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="font-medium">{hotel.name}</div>
                            {hotel.starRating && <div className="text-xs text-muted-foreground">{hotel.starRating}★</div>}
                          </td>
                          <td className="py-3 px-4">
                            <div>{hotel.owner.firstName} {hotel.owner.lastName}</div>
                            <div className="text-xs text-muted-foreground">{hotel.owner.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {hotel.city}, {hotel.country}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={cn(
                              hotel.isVerified && !hotel.rejectionReason ? 'bg-green-100 text-green-800' : '',
                              !hotel.isVerified && !hotel.rejectionReason ? 'bg-yellow-100 text-yellow-800' : '',
                              hotel.rejectionReason ? 'bg-red-100 text-red-800' : ''
                            )}>
                              {hotel.rejectionReason ? 'Rejected' : hotel.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">{hotel.roomCount}</td>
                          <td className="py-3 px-4">
                            <Button size="sm" variant="ghost" onClick={() => handleViewDetail(hotel.id)}>
                              <Eye className="h-3 w-3 mr-1" /> Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {allData?.hotels.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No hotels found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {allData && allData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((allPage - 1) * 20) + 1} to {Math.min(allPage * 20, allData.total)} of {allData.total}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={allPage === 1} onClick={() => setAllPage(allPage - 1)}>
                      Previous
                    </Button>
                    <Button size="sm" variant="outline" disabled={allPage === allData.totalPages} onClick={() => setAllPage(allPage + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hotel Detail Modal */}
      <Dialog open={!!selectedHotel || detailMutation.isPending} onOpenChange={() => setSelectedHotel(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHotel?.name ?? 'Loading...'}</DialogTitle>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedHotel.address}, {selectedHotel.city}, {selectedHotel.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Star Rating</p>
                  <p className="font-medium">{selectedHotel.starRating ? `${selectedHotel.starRating}★` : 'Not rated'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={cn(
                    selectedHotel.isVerified && !selectedHotel.rejectionReason ? 'bg-green-100 text-green-800' : '',
                    !selectedHotel.isVerified && !selectedHotel.rejectionReason ? 'bg-yellow-100 text-yellow-800' : '',
                    selectedHotel.rejectionReason ? 'bg-red-100 text-red-800' : ''
                  )}>
                    {selectedHotel.rejectionReason ? `Rejected: ${selectedHotel.rejectionReason}` : selectedHotel.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Average Rating</p>
                  <p className="font-medium">{selectedHotel.averageRating ? `${selectedHotel.averageRating}★` : 'No ratings yet'}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Owner</p>
                <p>{selectedHotel.owner.firstName} {selectedHotel.owner.lastName} — {selectedHotel.owner.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Description</p>
                <p>{selectedHotel.description ?? 'No description provided'}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.amenities.map((a) => (
                    <Badge key={a} variant="outline">{a}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Rooms ({selectedHotel.roomCount})</p>
                <div className="space-y-2">
                  {selectedHotel.rooms.map((room) => (
                    <div key={room.id} className="border rounded p-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{room.type}</span>
                        <span className="text-muted-foreground">${room.pricePerNight}/night</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Capacity: {room.capacity} • Total: {room.totalQuantity} • Active: {room.isActive ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={!!rejectHotelId} onOpenChange={() => setRejectHotelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Hotel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Reason for rejection</Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this hotel is being rejected..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectHotelId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() => rejectHotelId && rejectMutation.mutate({ hotelId: rejectHotelId, reason: rejectReason })}
              >
                Reject Hotel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
