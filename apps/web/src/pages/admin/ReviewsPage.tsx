// apps/web/src/pages/admin/ReviewsPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { ConfirmationAlert } from '../../components/hotel-admin/ConfirmationAlert';
import { getPendingReviews, getAllReviews, approveReview, rejectReview, deleteReview } from '../../services/api';
import type { AdminReviewItem } from '../../types/systemAdmin';
import { cn } from '../../lib/utils';

export const ReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['system-admin-reviews-pending'],
    queryFn: getPendingReviews,
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['system-admin-reviews-all', page, statusFilter],
    queryFn: () => getAllReviews({
      page,
      limit: 20,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => approveReview(reviewId),
    onSuccess: () => {
      toast.success('Review approved');
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-pending'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-all'] });
    },
    onError: () => toast.error('Failed to approve review'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reviewId: string) => rejectReview(reviewId),
    onSuccess: () => {
      toast.success('Review rejected');
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-pending'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-all'] });
    },
    onError: () => toast.error('Failed to reject review'),
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success('Review deleted');
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-pending'] });
      queryClient.invalidateQueries({ queryKey: ['system-admin-reviews-all'] });
    },
    onError: () => toast.error('Failed to delete review'),
  });

  const renderReviewCard = (review: AdminReviewItem, showActions: boolean = false, showDelete: boolean = false) => (
    <div key={review.id} className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center gap-0.5"
              title={`${review.rating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn('h-4 w-4', star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')}
                />
              ))}
            </div>
            <Badge variant="outline" className="ml-2">{review.isApproved ? 'Approved' : 'Pending'}</Badge>
          </div>
          <p className="text-sm mb-3">{review.comment}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>By: {review.user.firstName} {review.user.lastName}</span>
            <span>•</span>
            <span>{review.hotel.name}</span>
            <span>•</span>
            <span>{review.hotel.city}, {review.hotel.country}</span>
            <span>•</span>
            <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            {!review.isApproved && (
              <>
                <ConfirmationAlert
                  title="Approve Review"
                  description="Approve this review to make it visible on the hotel page?"
                  confirmLabel="Approve"
                  onConfirm={() => approveMutation.mutate(review.id)}
                >
                  <Button size="sm" variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" /> Approve
                  </Button>
                </ConfirmationAlert>
                <ConfirmationAlert
                  title="Reject Review"
                  description="Reject this review. It will be removed from the queue."
                  confirmLabel="Reject"
                  variant="destructive"
                  onConfirm={() => rejectMutation.mutate(review.id)}
                >
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> Reject
                  </Button>
                </ConfirmationAlert>
              </>
            )}
            {showDelete && (
              <ConfirmationAlert
                title="Delete Review"
                description="Permanently delete this review? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => deleteMutation.mutate(review.id)}
              >
                <Button size="sm" variant="ghost" className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </ConfirmationAlert>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>Moderate user-submitted reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                Pending Approval
                {pendingData && pendingData.reviews.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{pendingData.reviews.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="all">All Reviews</TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
            <TabsContent value="pending" className="mt-4">
              {pendingLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
              ) : pendingData?.reviews.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No pending reviews. Great job keeping up!
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingData?.reviews.map((review) => renderReviewCard(review, true, false))}
                </div>
              )}
            </TabsContent>

            {/* Approved Tab */}
            <TabsContent value="approved" className="mt-4">
              {allLoading ? (
                <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
              ) : (
                <div className="space-y-4">
                  {allData?.reviews
                    .filter((r) => r.isApproved)
                    .map((review) => renderReviewCard(review, false, true))}
                  {allData?.reviews.filter((r) => r.isApproved).length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">No approved reviews</div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* All Tab */}
            <TabsContent value="all" className="mt-4">
              {/* Filter */}
              <div className="flex items-center gap-4 mb-6">
                <select
                  className="flex h-9 w-36 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              {allLoading ? (
                <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
              ) : (
                <div className="space-y-4">
                  {allData?.reviews.map((review) => renderReviewCard(review, !review.isApproved, true))}
                  {allData?.reviews.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">No reviews found</div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {allData && allData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {allData.page} of {allData.totalPages} ({allData.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <Button size="sm" variant="outline" disabled={page === allData.totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
