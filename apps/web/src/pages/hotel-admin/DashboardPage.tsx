// apps/web/src/pages/hotel-admin/DashboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Building, DollarSign, UserCheck } from 'lucide-react';
import { getAdminDashboard } from '../../services/api';
import { StatsCard } from '../../components/hotel-admin/StatsCard';
import { BookingsLineChart } from '../../components/hotel-admin/charts/BookingsLineChart';
import { RevenueBarChart } from '../../components/hotel-admin/charts/RevenueBarChart';
import { OccupancyHeatmap } from '../../components/hotel-admin/charts/OccupancyHeatmap';
import { RecentBookingsTable } from '../../components/hotel-admin/RecentBookingsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export const DashboardPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: getAdminDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Failed to load dashboard data. Please refresh.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Bookings"
          value={data.todaysBookings}
          subtitle="Bookings today"
          icon={CalendarCheck}
        />
        <StatsCard
          title="Occupancy Rate"
          value={`${data.occupancyRate}%`}
          subtitle="Current occupancy"
          icon={Building}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${data.monthlyRevenue.toLocaleString()}`}
          subtitle="Revenue this month"
          icon={DollarSign}
        />
        <StatsCard
          title="Pending Check-ins"
          value={data.pendingCheckins}
          subtitle="Confirmed arrivals today"
          icon={UserCheck}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Bookings — Last 7 Days</CardTitle>
            <CardDescription>Daily booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsLineChart data={data.bookingsLast7Days} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Room Type</CardTitle>
            <CardDescription>This month's revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={data.revenueByRoomType} />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Occupancy Calendar</CardTitle>
          <CardDescription>Daily occupancy heatmap for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <OccupancyHeatmap occupancyRate={data.occupancyRate} />
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest 5 bookings across all your hotels</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentBookingsTable bookings={data.recentBookings} />
        </CardContent>
      </Card>
    </div>
  );
};