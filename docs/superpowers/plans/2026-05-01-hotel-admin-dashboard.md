# Hotel Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full hotel admin dashboard: 4 pages (/dashboard, /rooms, /bookings, /hotel-profile), backend dashboard API for HOTEL_ADMIN role, BottomNav mobile component, and all supporting components.

**Architecture:**
- Frontend: React + Vite + shadcn/ui + TanStack Query + Recharts, React Router for routing
- Backend: Express + Prisma, existing services extended with filters and new hotel-admin dashboard endpoint
- Mobile: Bottom tab navigation for `<lg`, sidebar for `lg+`
- Real-time feel: React Query `refetchInterval: 30000` on all admin queries

**Tech Stack:** React, TypeScript, shadcn/ui, TanStack Query, Recharts, date-fns, sonner, Express, Prisma

---

## File Map

### New Files (Frontend)
```
apps/web/src/
├── pages/hotel-admin/
│   ├── DashboardPage.tsx
│   ├── RoomsPage.tsx
│   ├── BookingsPage.tsx
│   └── HotelProfilePage.tsx
├── components/hotel-admin/
│   ├── StatsCard.tsx
│   ├── StatusBadge.tsx
│   ├── RecentBookingsTable.tsx
│   ├── RoomsTable.tsx
│   ├── AddRoomSheet.tsx
│   ├── InlinePriceEdit.tsx
│   ├── ImageGalleryManager.tsx
│   ├── BookingsTable.tsx
│   ├── BookingFilters.tsx
│   ├── ConfirmationAlert.tsx
│   └── charts/
│       ├── BookingsLineChart.tsx
│       ├── RevenueBarChart.tsx
│       └── OccupancyHeatmap.tsx
├── components/layout/
│   └── BottomNav.tsx
├── hooks/
│   └── useAdminToast.ts
└── types/
    └── admin.ts

### Modified Files (Frontend)
```
apps/web/src/
├── App.tsx                                    # Update routes: /admin/hotels/* → /hotel-admin/*
├── components/layout/HotelAdminLayout.tsx     # Update sidebar hrefs, add BottomNav
├── services/api.ts                            # Add all admin API functions
├── types/index.ts                             # Re-export admin types
└── components/ui/sheet.tsx                    # Ensure shadcn Sheet is available
```

### New Files (Backend)
```
apps/api/src/
├── controllers/hotel-admin-dashboard.controller.ts
├── services/hotel-admin-dashboard.service.ts
└── routes/hotel-admin-dashboard.routes.ts      # Can add to hotel-admin.routes.ts or create new
```

### Modified Files (Backend)
```
apps/api/src/
├── routes/hotel-admin.routes.ts               # Add /dashboard GET endpoint
├── routes/booking.routes.ts or hotel-admin.routes.ts  # Add filter params to getHotelAdminBookings
└── services/booking.service.ts                # Enhance getHotelAdminBookings with filters
```

---

## Task 1: Install recharts + Add backend dashboard endpoint + Enhance bookings filters

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/api/src/controllers/hotel-admin-dashboard.controller.ts`
- Create: `apps/api/src/services/hotel-admin-dashboard.service.ts`
- Modify: `apps/api/src/routes/hotel-admin.routes.ts`
- Modify: `apps/api/src/services/booking.service.ts`

- [ ] **Step 1: Install recharts in web app**

Run: `cd /Users/val/hotel\ management/hotel-reservation-system/apps/web && npm install recharts`

Expected: recharts added to package.json dependencies

- [ ] **Step 2: Create hotel-admin-dashboard.service.ts**

```typescript
// apps/api/src/services/hotel-admin-dashboard.service.ts
import { prisma } from '../utils/db';

interface HotelAdminDashboardData {
  todaysBookings: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingCheckins: number;
  bookingsLast7Days: Array<{ date: string; count: number }>;
  revenueByRoomType: Array<{ roomType: string; revenue: number }>;
  recentBookings: Array<{
    id: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: string;
    createdAt: Date;
    roomType: string;
    hotelName: string;
    guestEmail: string;
  }>;
}

export async function getHotelAdminDashboard(hotelAdminId: string): Promise<HotelAdminDashboardData> {
  const ownedHotels = await prisma.hotelOwner.findMany({
    where: { userId: hotelAdminId },
    select: { hotelId: true },
  });

  const hotelIds = ownedHotels.map((h) => h.hotelId);
  if (hotelIds.length === 0) {
    return {
      todaysBookings: 0,
      occupancyRate: 0,
      monthlyRevenue: 0,
      pendingCheckins: 0,
      bookingsLast7Days: [],
      revenueByRoomType: [],
      recentBookings: [],
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Last 7 days date range
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const [
    todaysBookings,
    pendingCheckins,
    monthlyRevenueResult,
    allRooms,
    bookingsLast7Days,
    revenueByRoomTypeResult,
    recentBookings,
  ] = await Promise.all([
    // Today's bookings count
    prisma.booking.count({
      where: {
        room: { hotelId: { in: hotelIds } },
        createdAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
    // Pending check-ins (CONFIRMED bookings with checkIn date = today)
    prisma.booking.count({
      where: {
        room: { hotelId: { in: hotelIds } },
        status: 'CONFIRMED',
        checkIn: { gte: startOfToday, lt: endOfToday },
      },
    }),
    // Monthly revenue (paid payments this month)
    prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth },
        booking: { room: { hotelId: { in: hotelIds } } },
      },
      _sum: { amount: true },
    }),
    // All rooms for occupancy calculation
    prisma.room.findMany({
      where: { hotelId: { in: hotelIds }, isActive: true },
      select: { totalQuantity: true, availableQuantity: true },
    }),
    // Bookings per day for last 7 days
    prisma.booking.findMany({
      where: {
        room: { hotelId: { in: hotelIds } },
        createdAt: { gte: last7Days[0], lt: endOfToday },
      },
      select: { createdAt: true },
    }),
    // Revenue by room type (paid bookings this month)
    prisma.booking.findMany({
      where: {
        room: { hotelId: { in: hotelIds } },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
      include: { room: { select: { type: true } } },
    }),
    // Recent bookings (last 5)
    prisma.booking.findMany({
      where: { room: { hotelId: { in: hotelIds } } },
      include: {
        room: { include: { hotel: { select: { name: true } } } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Calculate occupancy rate: (total rooms - total available) / total rooms
  const totalRooms = allRooms.reduce((sum, r) => sum + r.totalQuantity, 0);
  const totalAvailable = allRooms.reduce((sum, r) => sum + Number(r.availableQuantity), 0);
  const occupiedRooms = totalRooms - totalAvailable;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Aggregate bookings last 7 days by date
  const bookingsByDate = last7Days.map((day) => {
    const dayStr = day.toISOString().split('T')[0];
    const count = bookingsLast7Days.filter(
      (b) => b.createdAt.toISOString().split('T')[0] === dayStr
    ).length;
    return { date: dayStr, count };
  });

  // Aggregate revenue by room type
  const revenueMap = new Map<string, number>();
  for (const b of revenueByRoomTypeResult) {
    const current = revenueMap.get(b.room.type) ?? 0;
    revenueMap.set(b.room.type, current + Number(b.totalPrice));
  }
  const revenueByRoomType = Array.from(revenueMap.entries()).map(([roomType, revenue]) => ({
    roomType,
    revenue,
  }));

  return {
    todaysBookings,
    occupancyRate,
    monthlyRevenue: Number(monthlyRevenueResult._sum.amount) || 0,
    pendingCheckins,
    bookingsLast7Days: bookingsByDate,
    revenueByRoomType,
    recentBookings: recentBookings.map((b) => ({
      id: b.id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      createdAt: b.createdAt,
      roomType: b.room.type,
      hotelName: b.room.hotel.name,
      guestEmail: b.user.email,
    })),
  };
}
```

- [ ] **Step 3: Create hotel-admin-dashboard.controller.ts**

```typescript
// apps/api/src/controllers/hotel-admin-dashboard.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { getHotelAdminDashboard } from '../services/hotel-admin-dashboard.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export async function getHotelAdminDashboardHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const dashboard = await getHotelAdminDashboard(req.user.id);
    sendSuccess(res, dashboard);
  } catch (err) {
    next(err);
  }
}
```

- [ ] **Step 4: Add route to hotel-admin.routes.ts**

Add after existing routes (around line 19):
```typescript
import { getHotelAdminDashboardHandler } from '../controllers/hotel-admin-dashboard.controller';

// ... existing code ...
router.get('/dashboard', getHotelAdminDashboardHandler);
```

- [ ] **Step 5: Enhance getHotelAdminBookings with filters**

Modify the `getHotelAdminBookings` function in `apps/api/src/services/booking.service.ts` to accept an optional filters object. Read the full function first, then update.

New signature:
```typescript
export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  roomType?: string;
  guestName?: string;
  page?: number;
  limit?: number;
}

export async function getHotelAdminBookings(
  hotelAdminId: string,
  filters: BookingFilters = {}
) {
  const { status, dateFrom, dateTo, roomType, guestName, page = 1, limit = 10 } = filters;
  // ... existing hotel ownership check ...
  
  // Build where clause
  const whereClause: any = { room: { hotelId: { in: hotelIds } } };
  
  if (status && status !== 'ALL') {
    whereClause.status = status;
  }
  if (dateFrom) {
    whereClause.checkIn = { ...whereClause.checkIn, gte: new Date(dateFrom) };
  }
  if (dateTo) {
    whereClause.checkOut = { ...whereClause.checkOut, lte: new Date(dateTo) };
  }
  if (roomType && roomType !== 'ALL') {
    whereClause.room = { ...whereClause.room, type: roomType };
  }
  if (guestName) {
    whereClause.user = {
      ...whereClause.user,
      OR: [
        { firstName: { contains: guestName, mode: 'insensitive' } },
        { lastName: { contains: guestName, mode: 'insensitive' } },
        { email: { contains: guestName, mode: 'insensitive' } },
      ],
    };
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereClause,
      include: {
        room: { include: { hotel: true } },
        payments: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where: whereClause }),
  ]);

  return {
    bookings: bookings.map(normalizeBooking),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

Also update the controller to pass query params as filters.

- [ ] **Step 6: Commit**

```bash
cd /Users/val/hotel\ management/hotel-reservation-system
git add -A
git commit -m "feat(hotel-admin): add dashboard API and enhance bookings with filters"
```

---

## Task 2: Create BottomNav + Update Routes + Add admin types + API functions

**Files:**
- Create: `apps/web/src/components/layout/BottomNav.tsx`
- Create: `apps/web/src/types/admin.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/components/layout/HotelAdminLayout.tsx`
- Modify: `apps/web/src/services/api.ts`
- Modify: `apps/web/src/types/index.ts`

- [ ] **Step 1: Create admin types**

```typescript
// apps/web/src/types/admin.ts
import type { BookingStatus, RoomType } from '@hotel/shared';

export interface AdminDashboardData {
  todaysBookings: number;
  occupancyRate: number;
  monthlyRevenue: number;
  pendingCheckins: number;
  bookingsLast7Days: Array<{ date: string; count: number }>;
  revenueByRoomType: Array<{ roomType: string; revenue: number }>;
  recentBookings: AdminRecentBooking[];
}

export interface AdminRecentBooking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  roomType: string;
  hotelName: string;
  guestEmail: string;
}

export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  roomType?: string;
  guestName?: string;
  page?: number;
  limit?: number;
}

export interface AdminBookingListResponse {
  bookings: AdminBooking[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminBooking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests: string | null;
  createdAt: Date;
  confirmationNumber: string;
  room: {
    id: string;
    type: RoomType;
    description: string | null;
    pricePerNight: number;
    capacity: number;
    bedType: string | null;
    amenities: string[];
    images: string[];
    hotel: {
      id: string;
      name: string;
      address: string;
      city: string;
      country: string;
      starRating: number | null;
      amenities: string[];
      images: string[];
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    transactionId: string | null;
    paidAt: Date | null;
    createdAt: Date;
  }>;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RoomManagementItem {
  id: string;
  hotelId: string;
  type: RoomType;
  description: string | null;
  pricePerNight: number;
  capacity: number;
  bedType: string | null;
  roomSize: number | null;
  amenities: string[];
  images: string[];
  totalQuantity: number;
  availableQuantity: number;
}

export interface CreateRoomData {
  type: RoomType;
  description?: string;
  pricePerNight: number;
  capacity: number;
  bedType?: string;
  roomSize?: number;
  amenities?: string[];
  images?: string[];
  totalQuantity: number;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}
```

- [ ] **Step 2: Create BottomNav.tsx**

```tsx
// apps/web/src/components/layout/BottomNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, DoorOpen, CalendarCheck, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/hotel-admin/dashboard', icon: LayoutDashboard },
  { label: 'Rooms', href: '/hotel-admin/rooms', icon: DoorOpen },
  { label: 'Bookings', href: '/hotel-admin/bookings', icon: CalendarCheck },
  { label: 'Profile', href: '/hotel-admin/hotel-profile', icon: User },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden border-t bg-background">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
```

- [ ] **Step 3: Update HotelAdminLayout sidebar links**

Change sidebar hrefs from `/admin/hotels/*` to `/hotel-admin/*`:
```typescript
const sidebarItems = [
  { label: 'Dashboard', href: '/hotel-admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Rooms', href: '/hotel-admin/rooms', icon: <DoorOpen className="h-4 w-4" /> },
  { label: 'Bookings', href: '/hotel-admin/bookings', icon: <CalendarCheck className="h-4 w-4" /> },
  { label: 'Profile', href: '/hotel-admin/hotel-profile', icon: <User className="h-4 w-4" /> },
];
```

Also add `import { BottomNav }` and render it inside the return, after the closing `</div>` of the main content area, or inside the outer div just before the closing tag (just before `</div>`). The BottomNav should be outside the flex content area.

- [ ] **Step 4: Update App.tsx routes**

Change from:
```tsx
<Route path="/admin/hotels" element={<div>Hotel Dashboard</div>} />
<Route path="/admin/hotels/rooms" element={<div>Rooms</div>} />
<Route path="/admin/hotels/bookings" element={<div>Bookings</div>} />
<Route path="/admin/hotels/profile" element={<ProfilePage />} />
```

Change allowedRoles from `['hotel_owner']` to `['hotel_owner', 'HOTEL_ADMIN', 'SYSTEM_ADMIN']` for hotel admin routes. Update path to:
```tsx
<Route path="/hotel-admin/dashboard" element={<DashboardPage />} />
<Route path="/hotel-admin/rooms" element={<RoomsPage />} />
<Route path="/hotel-admin/bookings" element={<BookingsPage />} />
<Route path="/hotel-admin/hotel-profile" element={<HotelProfilePage />} />
```

Also update the page title logic in `getPageTitle`:
```typescript
const getPageTitle = () => {
  if (location.pathname.includes('/rooms')) return 'Rooms Management';
  if (location.pathname.includes('/bookings')) return 'Bookings';
  if (location.pathname.includes('/hotel-profile')) return 'Hotel Profile';
  return 'Dashboard';
};
```

- [ ] **Step 5: Add API functions to api.ts**

Add these functions to `apps/web/src/services/api.ts` (before the `export { queryClient }` line):

```typescript
// Admin Dashboard
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await api.get<AdminDashboardData>('/hotel-admin/dashboard');
  return data;
}

// Admin Bookings
export async function getHotelAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingListResponse> {
  const { data } = await api.get<AdminBookingListResponse>('/hotel-admin/bookings', { params: filters });
  return data;
}

export async function confirmBooking(id: string): Promise<AdminBooking> {
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/confirm`);
  return data;
}

export async function checkInBooking(id: string): Promise<AdminBooking> {
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/check-in`);
  return data;
}

export async function checkOutBooking(id: string): Promise<AdminBooking> {
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/check-out`);
  return data;
}

export async function cancelBookingAdmin(id: string): Promise<AdminBooking> {
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/cancel`);
  return data;
}

// Rooms
export async function getHotelRooms(hotelId: string): Promise<RoomManagementItem[]> {
  const { data } = await api.get<RoomManagementItem[]>(`/hotels/${hotelId}/rooms`);
  return data;
}

export async function createRoom(hotelId: string, roomData: CreateRoomData): Promise<RoomManagementItem> {
  const { data } = await api.post<RoomManagementItem>(`/hotels/${hotelId}/rooms`, roomData);
  return data;
}

export async function updateRoom(hotelId: string, roomId: string, roomData: UpdateRoomData): Promise<RoomManagementItem> {
  const { data } = await api.put<RoomManagementItem>(`/hotels/${hotelId}/rooms/${roomId}`, roomData);
  return data;
}

export async function deleteRoom(hotelId: string, roomId: string): Promise<void> {
  await api.delete(`/hotels/${hotelId}/rooms/${roomId}`);
}

// Hotel Profile
export async function getHotelProfile(hotelId: string): Promise<HotelProfileData> {
  const { data } = await api.get<HotelProfileData>(`/hotels/${hotelId}`);
  return data;
}

export async function updateHotelProfile(hotelId: string, hotelData: UpdateHotelData): Promise<HotelProfileData> {
  const { data } = await api.put<HotelProfileData>(`/hotels/${hotelId}`, hotelData);
  return data;
}
```

Also add imports at the top of api.ts:
```typescript
import type { AdminDashboardData, BookingFilters, AdminBookingListResponse, AdminBooking, RoomManagementItem, CreateRoomData, UpdateRoomData, HotelProfileData, UpdateHotelData } from '../types/admin';
// Note: HotelProfileData and UpdateHotelData will be defined in Task 5
```

- [ ] **Step 6: Update types/index.ts**

Add to `apps/web/src/types/index.ts`:
```typescript
export * from './admin';
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(hotel-admin): routing, BottomNav, types, API functions"
```

---

## Task 3: DashboardPage + StatsCard + Charts

**Files:**
- Create: `apps/web/src/pages/hotel-admin/DashboardPage.tsx`
- Create: `apps/web/src/components/hotel-admin/StatsCard.tsx`
- Create: `apps/web/src/components/hotel-admin/charts/BookingsLineChart.tsx`
- Create: `apps/web/src/components/hotel-admin/charts/RevenueBarChart.tsx`
- Create: `apps/web/src/components/hotel-admin/charts/OccupancyHeatmap.tsx`
- Create: `apps/web/src/components/hotel-admin/RecentBookingsTable.tsx`

- [ ] **Step 1: Create StatsCard.tsx**

```tsx
// apps/web/src/components/hotel-admin/StatsCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('flex-1 min-w-[200px]', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trend && (
              <p className={cn('text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

Note: import `cn` from `'../../lib/utils'` and ensure the Card components from shadcn are available.

- [ ] **Step 2: Create BookingsLineChart.tsx**

```tsx
// apps/web/src/components/hotel-admin/charts/BookingsLineChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingsLineChartProps {
  data: Array<{ date: string; count: number }>;
}

export const BookingsLineChart: React.FC<BookingsLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 3: Create RevenueBarChart.tsx**

```tsx
// apps/web/src/components/hotel-admin/charts/RevenueBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueBarChartProps {
  data: Array<{ roomType: string; revenue: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="roomType" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
```

- [ ] **Step 4: Create OccupancyHeatmap.tsx**

```tsx
// apps/web/src/components/hotel-admin/charts/OccupancyHeatmap.tsx
import { format, startOfWeek, addDays, getDaysInMonth } from 'date-fns';

interface OccupancyHeatmapProps {
  occupancyRate?: number; // overall rate, used to generate mock data
}

export const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ occupancyRate = 65 }) => {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now);
  const firstDay = startOfWeek(new Date(now.getFullYear(), now.getMonth(), 1));
  const weeks: Date[][] = [];

  let current = firstDay;
  for (let w = 0; w < 5; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current));
      current = addDays(current, 1);
    }
    weeks.push(week);
  }

  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-muted';
    if (rate < 30) return 'bg-green-200';
    if (rate < 60) return 'bg-green-400';
    if (rate < 80) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Generate deterministic mock occupancy
  const getOccupancy = (day: Date) => {
    if (day > now) return 0;
    const seed = day.getDate();
    return ((seed * occupancyRate * 7) % 100);
  };

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-2">{format(now, 'MMMM yyyy')} — Occupancy Heatmap</p>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <p key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</p>
        ))}
        {weeks.flat().map((day, idx) => {
          const rate = getOccupancy(day);
          const isCurrentMonth = day.getMonth() === now.getMonth();
          return (
            <div
              key={idx}
              className={cn(
                'h-8 w-full rounded-sm flex items-center justify-center text-xs font-medium',
                getColor(rate),
                !isCurrentMonth && 'opacity-30'
              )}
              title={`${format(day, 'MMM d')}: ${rate}% occupied`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2 justify-end">
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-muted inline-block" /> 0%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-green-200 inline-block" /> &lt;30%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> 30-60%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-yellow-400 inline-block" /> 60-80%</span>
        <span className="flex items-center gap-1 text-xs"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> &gt;80%</span>
      </div>
    </div>
  );
};
```

Note: import `cn` from `'../../../lib/utils'`.

- [ ] **Step 5: Create RecentBookingsTable.tsx**

```tsx
// apps/web/src/components/hotel-admin/RecentBookingsTable.tsx
import { format } from 'date-fns';
import { StatusBadge } from './StatusBadge';

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
```

- [ ] **Step 6: Create StatusBadge.tsx**

```tsx
// apps/web/src/components/hotel-admin/StatusBadge.tsx
import { cn } from '../../lib/utils';
import type { BookingStatus } from '@hotel/shared';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  NO_SHOW: { label: 'No-show', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] ?? { label: status, className: 'bg-muted' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
};
```

- [ ] **Step 7: Create DashboardPage.tsx**

```tsx
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
            <CardDescription>This month’s revenue breakdown</CardDescription>
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
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(hotel-admin): dashboard page with stats, charts, recent bookings"
```

---

## Task 4: RoomsPage + AddRoomSheet + InlinePriceEdit + ImageGalleryManager

**Files:**
- Create: `apps/web/src/pages/hotel-admin/RoomsPage.tsx`
- Create: `apps/web/src/components/hotel-admin/RoomsTable.tsx`
- Create: `apps/web/src/components/hotel-admin/AddRoomSheet.tsx`
- Create: `apps/web/src/components/hotel-admin/InlinePriceEdit.tsx`
- Create: `apps/web/src/components/hotel-admin/ImageGalleryManager.tsx`
- Create: `apps/web/src/components/hotel-admin/ConfirmationAlert.tsx`

- [ ] **Step 1: Create ConfirmationAlert.tsx**

```tsx
// apps/web/src/components/hotel-admin/ConfirmationAlert.tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface ConfirmationAlertProps {
  trigger?: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
  children?: React.ReactNode;
}

export const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  children,
}) => {
  return (
    <AlertDialog>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      {children}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

- [ ] **Step 2: Create ImageGalleryManager.tsx**

```tsx
// apps/web/src/components/hotel-admin/ImageGalleryManager.tsx
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  images,
  onChange,
  disabled = false,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const addImage = () => {
    const url = urlInput.trim();
    if (url && !images.includes(url)) {
      onChange([...images, url]);
      setUrlInput('');
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste image URL..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addImage()}
          disabled={disabled}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={addImage} disabled={disabled || !urlInput.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Room image ${idx + 1}`}
                className="w-full h-20 object-cover rounded-md border"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'; }}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground w-5 h-5 flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Create InlinePriceEdit.tsx**

```tsx
// apps/web/src/components/hotel-admin/InlinePriceEdit.tsx
import { useState, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface InlinePriceEditProps {
  value: number;
  onSave: (value: number) => void;
  disabled?: boolean;
}

export const InlinePriceEdit: React.FC<InlinePriceEditProps> = ({ value, onSave, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const save = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(String(value));
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={startEdit}
        className="font-mono text-sm hover:text-primary transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        ${value.toLocaleString()}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">$</span>
      <Input
        ref={inputRef}
        type="number"
        min={0}
        step="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="w-24 h-7 text-sm"
      />
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={save}>
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={cancel}>
        <X className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
};
```

- [ ] **Step 4: Create AddRoomSheet.tsx**

```tsx
// apps/web/src/components/hotel-admin/AddRoomSheet.tsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { ImageGalleryManager } from './ImageGalleryManager';
import type { RoomManagementItem, CreateRoomData } from '../../types/admin';
import type { RoomType } from '@hotel/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createRoom, updateRoom } from '../../services/api';

const AMENITIES_OPTIONS = [
  'WiFi', 'Pool', 'Parking', 'Air Conditioning', 'TV', 'Mini Bar',
  'Safe', 'Balcony', 'Ocean View', 'Smoking Allowed', 'Room Service',
  'Gym', 'Spa', 'Pet Friendly',
];

const ROOM_TYPES: RoomType[] = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY'];

interface AddRoomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  room?: RoomManagementItem | null;
  onSuccess?: () => void;
}

export const AddRoomSheet: React.FC<AddRoomSheetProps> = ({
  open,
  onOpenChange,
  hotelId,
  room,
  onSuccess,
}) => {
  const isEdit = Boolean(room);
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateRoomData>({
    type: 'SINGLE',
    description: '',
    pricePerNight: 0,
    capacity: 1,
    bedType: '',
    roomSize: undefined,
    amenities: [],
    images: [],
    totalQuantity: 1,
  });

  useEffect(() => {
    if (room) {
      setForm({
        type: room.type,
        description: room.description ?? '',
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        bedType: room.bedType ?? '',
        roomSize: room.roomSize ?? undefined,
        amenities: room.amenities,
        images: room.images,
        totalQuantity: room.totalQuantity,
      });
    } else {
      setForm({ type: 'SINGLE', description: '', pricePerNight: 0, capacity: 1, bedType: '', roomSize: undefined, amenities: [], images: [], totalQuantity: 1 });
    }
  }, [room, open]);

  const mutation = useMutation({
    mutationFn: (data: CreateRoomData) =>
      isEdit ? updateRoom(hotelId, room.id, data) : createRoom(hotelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success(isEdit ? 'Room updated successfully' : 'Room created successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error(isEdit ? 'Failed to update room' : 'Failed to create room');
    },
  });

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Room' : 'Add New Room'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update room details below.' : 'Fill in the room details to create a new room type.'}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Room Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Total Quantity *</Label>
              <Input type="number" min={1} value={form.totalQuantity} onChange={(e) => setForm({ ...form, totalQuantity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Price/Night * ($)</Label>
              <Input type="number" min={0} step="0.01" value={form.pricePerNight} onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
            </div>
            <div className="grid gap-2">
              <Label>Capacity * (guests)</Label>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Bed Type</Label>
              <Input placeholder="e.g. King, Twin" value={form.bedType ?? ''} onChange={(e) => setForm({ ...form, bedType: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Room Size (m²)</Label>
              <Input type="number" min={0} value={form.roomSize ?? ''} onChange={(e) => setForm({ ...form, roomSize: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Room description..." />
          </div>

          <div className="grid gap-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-2">
              {AMENITIES_OPTIONS.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={form.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal cursor-pointer">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <ImageGalleryManager
              images={form.images ?? []}
              onChange={(images) => setForm({ ...form, images })}
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Room' : 'Create Room'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
```

- [ ] **Step 5: Create RoomsTable.tsx**

```tsx
// apps/web/src/components/hotel-admin/RoomsTable.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { InlinePriceEdit } from './InlinePriceEdit';
import { ConfirmationAlert } from './ConfirmationAlert';
import { toast } from 'sonner';
import { updateRoom, deleteRoom } from '../../services/api';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { RoomManagementItem } from '../../types/admin';

interface RoomsTableProps {
  rooms: RoomManagementItem[];
  hotelId: string;
  onEdit: (room: RoomManagementItem) => void;
}

export const RoomsTable: React.FC<RoomsTableProps> = ({ rooms, hotelId, onEdit }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (roomId: string) => deleteRoom(hotelId, roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success('Room deleted');
    },
    onError: () => toast.error('Failed to delete room'),
  });

  const priceMutation = useMutation({
    mutationFn: ({ roomId, price }: { roomId: string; price: number }) =>
      updateRoom(hotelId, roomId, { pricePerNight: price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-rooms', hotelId] });
      toast.success('Price updated');
    },
    onError: () => toast.error('Failed to update price'),
  });

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Room Type</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price/Night</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Capacity</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Available</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-t hover:bg-muted/30">
              <td className="py-3 px-4 font-medium">{room.type}</td>
              <td className="py-3 px-4">
                <InlinePriceEdit
                  value={room.pricePerNight}
                  onSave={(price) => priceMutation.mutate({ roomId: room.id, price })}
                />
              </td>
              <td className="py-3 px-4">{room.capacity}</td>
              <td className="py-3 px-4">{room.totalQuantity}</td>
              <td className={cn('py-3 px-4 font-medium', room.availableQuantity > 0 ? 'text-green-600' : 'text-red-600')}>
                {room.availableQuantity}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(room)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmationAlert
                    trigger={
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete Room"
                    description={`Are you sure you want to delete the ${room.type} room? This action cannot be undone.`}
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => deleteMutation.mutate(room.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-muted-foreground">No rooms found. Add your first room.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
```

- [ ] **Step 6: Create RoomsPage.tsx**

```tsx
// apps/web/src/pages/hotel-admin/RoomsPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getHotelRooms } from '../../services/api';
import { RoomsTable } from '../../components/hotel-admin/RoomsTable';
import { AddRoomSheet } from '../../components/hotel-admin/AddRoomSheet';
import type { RoomManagementItem } from '../../types/admin';
import { useAuth } from '../../hooks/useAuth';

// NOTE: hotelId will come from the user's owned hotels. For now, mock or derive from user context.
// In production, fetch the user's hotels and use the first one.
const MOCK_HOTEL_ID = 'mock-hotel-id'; // Replace with actual hotel ID lookup

export const RoomsPage: React.FC = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomManagementItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual hotel ID from auth context
  // const { user } = useAuth();
  // For now, use a placeholder - in Task 5, the hotel-profile page will set this properly
  const hotelId = MOCK_HOTEL_ID;

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['hotel-rooms', hotelId],
    queryFn: () => getHotelRooms(hotelId),
    enabled: hotelId !== MOCK_HOTEL_ID,
    refetchInterval: 30000,
  });

  const filteredRooms = rooms.filter((r) =>
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (room: RoomManagementItem) => {
    setEditingRoom(room);
    setSheetOpen(true);
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Rooms</h2>
          <p className="text-sm text-muted-foreground">Manage your hotel rooms and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
        </div>
      ) : (
        <RoomsTable rooms={filteredRooms} hotelId={hotelId} onEdit={handleEdit} />
      )}

      <AddRoomSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditingRoom(null);
        }}
        hotelId={hotelId}
        room={editingRoom}
      />
    </div>
  );
};
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(hotel-admin): rooms page with table, sheet, inline price edit"
```

---

## Task 5: BookingsPage + HotelProfilePage + CSV export

**Files:**
- Create: `apps/web/src/pages/hotel-admin/BookingsPage.tsx`
- Create: `apps/web/src/components/hotel-admin/BookingFilters.tsx`
- Create: `apps/web/src/components/hotel-admin/BookingsTable.tsx`
- Create: `apps/web/src/pages/hotel-admin/HotelProfilePage.tsx`

- [ ] **Step 1: Create BookingFilters.tsx**

```tsx
// apps/web/src/components/hotel-admin/BookingFilters.tsx
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import type { BookingFilters } from '../../types/admin';

interface BookingFiltersProps {
  filters: BookingFilters;
  onChange: (filters: BookingFilters) => void;
  onExportCSV: () => void;
  hasSelectedRows: boolean;
  onBulkConfirm: () => void;
  onBulkCancel: () => void;
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
const ROOM_TYPES = ['ALL', 'SINGLE', 'DOUBLE', 'SUITE', 'DELUXE', 'FAMILY'];

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  onChange,
  onExportCSV,
  hasSelectedRows,
  onBulkConfirm,
  onBulkCancel,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filters.status ?? 'ALL'} onValueChange={(v) => onChange({ ...filters, status: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">From Date</Label>
          <Input type="date" className="w-40"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">To Date</Label>
          <Input type="date" className="w-40"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Room Type</Label>
          <Select value={filters.roomType ?? 'ALL'} onValueChange={(v) => onChange({ ...filters, roomType: v })}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((r) => <SelectItem key={r} value={r}>{r === 'ALL' ? 'All Types' : r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs">Guest Name</Label>
          <Input placeholder="Search guest..." className="w-44"
            value={filters.guestName ?? ''}
            onChange={(e) => onChange({ ...filters, guestName: e.target.value || undefined })}
          />
        </div>

        <Button variant="outline" onClick={onExportCSV} className="self-end">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>

        {hasSelectedRows && (
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="default" onClick={onBulkConfirm}>Bulk Confirm</Button>
            <Button size="sm" variant="destructive" onClick={onBulkCancel}>Bulk Cancel</Button>
          </div>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create BookingsTable.tsx**

```tsx
// apps/web/src/components/hotel-admin/BookingsTable.tsx
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ConfirmationAlert } from './ConfirmationAlert';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../lib/utils';
import type { AdminBooking } from '../../types/admin';
import type { BookingStatus } from '@hotel/shared';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmBooking, checkInBooking, checkOutBooking, cancelBookingAdmin } from '../../services/api';

interface BookingsTableProps {
  bookings: AdminBooking[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const getActions = (status: BookingStatus, bookingId: string, queryClient: ReturnType<typeof useQueryClient>, onSuccess?: () => void) => {
  const baseProps = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] }); onSuccess?.(); } };

  if (status === 'PENDING') {
    return (
      <>
        <ConfirmationAlert
          title="Confirm Booking"
          description="This will confirm the booking. The guest will be notified."
          confirmLabel="Confirm"
          onConfirm={() => confirmBooking(bookingId).then(() => { toast.success('Booking confirmed'); baseProps.onSuccess(); }).catch(() => toast.error('Failed to confirm'))}
        >
          <Button size="sm" variant="outline"><Check className="h-3 w-3 mr-1" /> Confirm</Button>
        </ConfirmationAlert>
        <ConfirmationAlert
          title="Cancel Booking"
          description="This will cancel the booking."
          confirmLabel="Cancel"
          variant="destructive"
          onConfirm={() => cancelBookingAdmin(bookingId).then(() => { toast.success('Booking cancelled'); baseProps.onSuccess(); }).catch(() => toast.error('Failed to cancel'))}
        >
          <Button size="sm" variant="ghost" className="text-destructive"><X className="h-3 w-3 mr-1" /> Cancel</Button>
        </ConfirmationAlert>
      </>
    );
  }
  if (status === 'CONFIRMED') {
    return (
      <>
        <ConfirmationAlert
          title="Check-in Guest"
          description="This will mark the guest as checked in."
          confirmLabel="Check-in"
          onConfirm={() => checkInBooking(bookingId).then(() => { toast.success('Checked in'); baseProps.onSuccess(); }).catch(() => toast.error('Failed to check in'))}
        >
          <Button size="sm" variant="outline"><Check className="h-3 w-3 mr-1" /> Check-in</Button>
        </ConfirmationAlert>
        <ConfirmationAlert
          title="Cancel Booking"
          description="This will cancel the booking."
          confirmLabel="Cancel"
          variant="destructive"
          onConfirm={() => cancelBookingAdmin(bookingId).then(() => { toast.success('Booking cancelled'); baseProps.onSuccess(); }).catch(() => toast.error('Failed to cancel'))}
        >
          <Button size="sm" variant="ghost" className="text-destructive"><X className="h-3 w-3 mr-1" /> Cancel</Button>
        </ConfirmationAlert>
      </>
    );
  }
  return null;
};

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
                  {getActions(booking.status as BookingStatus, booking.id, queryClient)}
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
```

- [ ] **Step 3: Create BookingsPage.tsx**

```tsx
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
    onSuccess: () => {
      toast.success(`${selectedIds.size} bookings confirmed`);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['hotel-admin-bookings'] });
    },
    onError: () => toast.error('Bulk confirm failed'),
  });

  const bulkCancelMutation = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(cancelBookingAdmin)),
    onSuccess: () => {
      toast.success(`${selectedIds.size} bookings cancelled`);
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
```

- [ ] **Step 4: Create HotelProfilePage.tsx**

```tsx
// apps/web/src/pages/hotel-admin/HotelProfilePage.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { ImageGalleryManager } from '../../components/hotel-admin/ImageGalleryManager';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getHotelProfile, updateHotelProfile } from '../../services/api';

// TODO: Replace with actual hotel ID from auth context
const MOCK_HOTEL_ID = 'mock-hotel-id';

const AMENITIES_OPTIONS = [
  'WiFi', 'Pool', 'Parking', 'Air Conditioning', 'TV', 'Mini Bar',
  'Safe', 'Balcony', 'Ocean View', 'Smoking Allowed', 'Room Service',
  'Gym', 'Spa', 'Pet Friendly', 'Beach Access', 'Airport Shuttle',
];

export const HotelProfilePage: React.FC = () => {
  const hotelId = MOCK_HOTEL_ID;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    starRating: 0,
    amenities: [] as string[],
    images: [] as string[],
  });

  const [starRatingHover, setStarRatingHover] = useState(0);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ['hotel-profile', hotelId],
    queryFn: () => getHotelProfile(hotelId),
    enabled: hotelId !== MOCK_HOTEL_ID,
  });

  useEffect(() => {
    if (hotel) {
      setForm({
        name: hotel.name,
        description: hotel.description ?? '',
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        starRating: hotel.starRating ?? 0,
        amenities: hotel.amenities,
        images: hotel.images,
      });
    }
  }, [hotel]);

  const mutation = useMutation({
    mutationFn: () => updateHotelProfile(hotelId, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-profile', hotelId] });
      toast.success('Hotel profile updated');
    },
    onError: () => toast.error('Failed to update hotel profile'),
  });

  const toggleAmenity = (amenity: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Hotel Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your hotel information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your hotel details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Hotel Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Hotel name" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your hotel..." />
            </div>
            <div className="grid gap-2">
              <Label>Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Country *</Label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Star Rating</CardTitle>
          <CardDescription>Click to set your hotel's star rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, starRating: star })}
                onMouseEnter={() => setStarRatingHover(star)}
                onMouseLeave={() => setStarRatingHover(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={cn(
                    'h-7 w-7 transition-colors',
                    star <= (starRatingHover || form.starRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
          <CardDescription>Select the amenities your hotel offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  id={`profile-amenity-${amenity}`}
                  checked={form.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={`profile-amenity-${amenity}`} className="text-sm font-normal cursor-pointer">{amenity}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Add image URLs for your hotel gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageGalleryManager
            images={form.images}
            onChange={(images) => setForm({ ...form, images })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
        </CardHeader>
        <CardContent>
          {hotel?.isVerified ? (
            <div className="flex items-center gap-2 text-green-600">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium dark:bg-green-900/30 dark:text-green-400">
                ✓ Verified Hotel
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium dark:bg-yellow-900/30 dark:text-yellow-400">
                ✗ Not Yet Verified
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || hotelId === MOCK_HOTEL_ID}
        >
          {mutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(hotel-admin): bookings page with filters, bulk actions, CSV export; hotel profile page"
```

---

## Task 6: Integration Fixes + TypeScript + Mobile Testing

**Files:**
- All modified files from previous tasks

- [ ] **Step 1: Run TypeScript check and fix all errors**

Run: `cd /Users/val/hotel\ management/hotel-reservation-system/apps/web && npx tsc --noEmit 2>&1 | head -60`

Expected output: List of TypeScript errors. Fix each one.

Common issues to watch for:
- shadcn component imports (ensure Sheet, AlertDialog, etc. exist)
- `cn` function import from `../../lib/utils` (verify path is correct per file depth)
- `BookingStatus` and `RoomType` enum usage (ensure correct import path `@hotel/shared`)
- QueryClient not exported from api.ts (check if api.ts already exports `queryClient`)
- Missing `HotelProfileData` and `UpdateHotelData` types in admin.ts

- [ ] **Step 2: Verify shadcn Sheet component exists**

Run: `ls /Users/val/hotel\ management/hotel-reservation-system/apps/web/src/components/ui/ | grep sheet`

If not found, run: `cd /Users/val/hotel\ management/hotel-reservation-system/apps/web && npx shadcn@latest add sheet -y`

- [ ] **Step 3: Verify AlertDialog component exists**

Run: `ls /Users/val/hotel\ management/hotel-reservation-system/apps/web/src/components/ui/ | grep alert`

If not found, run: `npx shadcn@latest add alert-dialog -y`

- [ ] **Step 4: Fix any TypeScript errors found in Step 1**

Common fixes:
- If `cn` is imported from wrong path, fix the import path
- If `BookingStatus` is used as type, ensure `import type { BookingStatus } from '@hotel/shared'`
- If components are missing, run shadcn add commands
- If `HotelProfileData`/`UpdateHotelData` types are missing from admin.ts, add them:

```typescript
// Add to admin.ts
export interface HotelProfileData {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  country: string;
  starRating: number | null;
  amenities: string[];
  images: string[];
  isVerified: boolean;
}

export interface UpdateHotelData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  starRating?: number;
  amenities?: string[];
  images?: string[];
}
```

- [ ] **Step 5: Verify Mobile BottomNav**

Check that `HotelAdminLayout.tsx` renders `BottomNav` and it's set to `hidden lg:flex` (or `lg:hidden` + `fixed bottom-0`). Verify the CSS classes are correct for showing bottom nav only on mobile.

- [ ] **Step 6: Verify refetchInterval on all admin queries**

Search for `refetchInterval` to ensure all admin queries have `refetchInterval: 30000`.

- [ ] **Step 7: Final TypeScript check**

Run: `npx tsc --noEmit 2>&1`

Expected: No errors (or only pre-existing errors unrelated to the hotel admin work).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "fix(hotel-admin): TypeScript fixes and integration"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|---|---|
| `/hotel-admin/dashboard` with stats + 3 charts + recent table | Task 3 |
| `/hotel-admin/rooms` with data table, add modal, inline edit, gallery | Task 4 |
| `/hotel-admin/bookings` with filters, bulk actions, CSV export | Task 5 |
| `/hotel-admin/hotel-profile` with form + images + badge | Task 5 |
| Recharts charts | Task 3 |
| React Query refetchInterval: 30000 | All tasks |
| shadcn AlertDialog for confirmations | Task 4 |
| Role guard HOTEL_ADMIN | Task 2 (App.tsx) |
| BottomNav mobile | Task 2 |
| Toast feedback (sonner) | All tasks |
| Backend dashboard API for HOTEL_ADMIN | Task 1 |
| Enhanced bookings filters | Task 1 |

---

## Execution Options

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
