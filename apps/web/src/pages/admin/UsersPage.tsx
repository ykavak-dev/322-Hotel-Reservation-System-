// apps/web/src/pages/admin/UsersPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Ban, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmationAlert } from '../../components/hotel-admin/ConfirmationAlert';
import { getSystemUsers, updateUserRole, banUser, getUserActivity } from '../../services/api';
import type { UserRole } from '@hotel/shared';
import type { UserListItem } from '../../types/systemAdmin';
import { cn } from '../../lib/utils';

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Customer',
  HOTEL_ADMIN: 'Hotel Admin',
  SYSTEM_ADMIN: 'System Admin',
};

type RoleFilter = 'ALL' | UserRole;

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['system-admin-users', page, search, roleFilter, statusFilter],
    queryFn: () => getSystemUsers({
      page,
      limit: 20,
      role: roleFilter === 'ALL' ? undefined : roleFilter,
      search: search || undefined,
    }),
  });

  const { data: activityDataResponse, isLoading: activityLoading } = useQuery({
    queryKey: ['system-admin-user-activity', selectedUser?.id],
    queryFn: () => selectedUser ? getUserActivity(selectedUser.id) : undefined,
    enabled: !!selectedUser,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['system-admin-users'] });
    },
    onError: () => toast.error('Failed to update user role'),
  });

  const banMutation = useMutation({
    mutationFn: (userId: string) => banUser(userId),
    onSuccess: () => {
      toast.success('User banned');
      queryClient.invalidateQueries({ queryKey: ['system-admin-users'] });
    },
    onError: () => toast.error('Failed to ban user'),
  });

  const filteredUsers = data?.users.filter((u) => {
    if (statusFilter === 'active' && !u.isActive) return false;
    if (statusFilter === 'banned' && u.isActive) return false;
    return true;
  }) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name or email..."
                  className="pl-9 w-48"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Role</label>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as RoleFilter); setPage(1); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="HOTEL_ADMIN">Hotel Admin</SelectItem>
                  <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as 'all' | 'active' | 'banned'); setPage(1); }}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer" onClick={() => {}}>Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bookings</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/30">
                      <td className="py-3 px-4">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Select
                          value={user.role}
                          onValueChange={(v) => roleMutation.mutate({ userId: user.id, role: v })}
                          disabled={roleMutation.isPending}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="HOTEL_ADMIN">Hotel Admin</SelectItem>
                            <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={cn(
                          user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-center">{user._count.bookings}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-3 w-3 mr-1" /> Details
                          </Button>
                          {user.isActive && (
                            <ConfirmationAlert
                              title="Ban User"
                              description={`Are you sure you want to ban ${user.email}? They will not be able to log in.`}
                              confirmLabel="Ban"
                              variant="destructive"
                              onConfirm={() => banMutation.mutate(user.id)}
                            >
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Ban className="h-3 w-3 mr-1" /> Ban
                              </Button>
                            </ConfirmationAlert>
                          )}
                          {!user.isActive && (
                            <Button size="sm" variant="ghost" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" /> Unban
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} users
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

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details — {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{ROLE_LABELS[selectedUser.role] ?? selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={cn(selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                    {selectedUser.isActive ? 'Active' : 'Banned'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-medium">{format(new Date(selectedUser.createdAt), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recent Bookings</h4>
                {activityLoading ? (
                  <Skeleton className="h-20" />
                ) : activityDataResponse ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total: {activityDataResponse.totalBookings} bookings</p>
                    {activityDataResponse.bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{b.hotelName}</span>
                        <span className="text-muted-foreground">{b.status}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <h4 className="font-medium mb-2">Reviews</h4>
                {activityLoading ? (
                  <Skeleton className="h-20" />
                ) : activityDataResponse ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total: {activityDataResponse.totalReviews} reviews</p>
                    {activityDataResponse.reviews.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{r.hotelName} — {r.rating}★</span>
                        <Badge variant="outline">{r.isApproved ? 'Approved' : 'Pending'}</Badge>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
