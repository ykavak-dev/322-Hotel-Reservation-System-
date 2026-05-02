import { prisma } from '../utils/db';
import type { BookingStatus } from '../../generated/prisma';

interface KPITrend {
  value: number;
  percentChange: number;
}

interface DashboardStats {
  totalUsers: number;
  activeHotels: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  trends: {
    users: KPITrend;
    hotels: KPITrend;
    bookings: KPITrend;
    revenue: KPITrend;
  };
}

interface UserRegistrationTrend {
  date: string;
  count: number;
}

interface BookingStatusDistribution {
  status: BookingStatus;
  count: number;
}

interface RevenueTrend {
  date: string;
  revenue: number;
}

interface TopHotelByBookings {
  id: string;
  name: string;
  city: string;
  country: string;
  bookingCount: number;
  averageRating: number | null;
}

interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function calculateTrend(current: number, previous: number): KPITrend {
  if (previous === 0) {
    return { value: current, percentChange: current > 0 ? 100 : 0 };
  }
  const percentChange = ((current - previous) / previous) * 100;
  return { value: current, percentChange: Math.round(percentChange * 10) / 10 };
}

function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export async function getSystemDashboard(): Promise<DashboardStats> {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalHotels,
    bookingsThisMonth,
    revenueThisMonth,
    lastMonthUsers,
    lastMonthHotels,
    lastMonthBookings,
    lastMonthRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.hotel.count({ where: { isVerified: true } }),
    prisma.booking.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.payment.aggregate({
      where: { status: 'PAID', createdAt: { gte: thisMonthStart } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.hotel.count({ where: { isVerified: true, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.booking.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.payment.aggregate({
      where: { status: 'PAID', createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    }),
    prisma.hotel.count({ where: { isVerified: false } }),
  ]);

  return {
    totalUsers,
    activeHotels: totalHotels,
    bookingsThisMonth,
    revenueThisMonth: Number(revenueThisMonth._sum.amount) || 0,
    trends: {
      users: calculateTrend(totalUsers, lastMonthUsers),
      hotels: calculateTrend(totalHotels, lastMonthHotels),
      bookings: calculateTrend(bookingsThisMonth, lastMonthBookings),
      revenue: calculateTrend(Number(revenueThisMonth._sum.amount) || 0, Number(lastMonthRevenue._sum.amount) || 0),
    },
  };
}

export async function getUserRegistrationTrend(days: number = 30): Promise<UserRegistrationTrend[]> {
  const { start, end } = getDateRange(days);
  const result = await prisma.user.groupBy({
    by: ['createdAt'],
    _count: { id: true },
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: 'asc' },
  });

  // Fill in missing dates with 0 count
  const dateMap = new Map<string, number>();
  const current = new Date(start);
  while (current <= end) {
    dateMap.set(current.toISOString().split('T')[0], 0);
    current.setDate(current.getDate() + 1);
  }
  for (const r of result) {
    const dateKey = new Date(r.createdAt).toISOString().split('T')[0];
    dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + r._count.id);
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
}

export async function getBookingStatusDistribution(): Promise<BookingStatusDistribution[]> {
  const results = await prisma.booking.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return results.map((r) => ({ status: r.status, count: r._count.id }));
}

export async function getRevenueTrend(days: number = 30): Promise<RevenueTrend[]> {
  const { start, end } = getDateRange(days);
  const result = await prisma.payment.findMany({
    where: {
      status: 'PAID',
      paidAt: { gte: start, lte: end },
    },
    select: {
      amount: true,
      paidAt: true,
    },
    orderBy: { paidAt: 'asc' },
  });

  // Group by date
  const dateMap = new Map<string, number>();
  const current = new Date(start);
  while (current <= end) {
    dateMap.set(current.toISOString().split('T')[0], 0);
    current.setDate(current.getDate() + 1);
  }
  for (const p of result) {
    if (p.paidAt) {
      const dateKey = new Date(p.paidAt).toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + Number(p.amount));
    }
  }

  return Array.from(dateMap.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getTopHotelsByBookings(limit: number = 5): Promise<TopHotelByBookings[]> {
  const hotelBookingCounts = await prisma.booking.groupBy({
    by: ['roomId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 100,
  });

  const roomIds = hotelBookingCounts.map((h) => h.roomId);
  const rooms = await prisma.room.findMany({
    where: { id: { in: roomIds } },
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          city: true,
          country: true,
          averageRating: true,
        },
      },
    },
  });

  const roomToHotel = Object.fromEntries(rooms.map((r) => [r.id, r.hotel]));
  const hotelMap = new Map<string, TopHotelByBookings>();

  for (const hbc of hotelBookingCounts) {
    const hotel = roomToHotel[hbc.roomId];
    if (!hotel) continue;
    const existing = hotelMap.get(hotel.id);
    if (existing) {
      existing.bookingCount += hbc._count.id;
    } else {
      hotelMap.set(hotel.id, {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        bookingCount: hbc._count.id,
        averageRating: hotel.averageRating,
      });
    }
  }

  return Array.from(hotelMap.values())
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, limit);
}

export async function getRecentActivityLogs(limit: number = 20): Promise<ActivityLogItem[]> {
  const logs = await prisma.adminActivityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      admin: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    details: log.details as Record<string, unknown> | null,
    createdAt: log.createdAt,
    admin: {
      firstName: log.admin.firstName,
      lastName: log.admin.lastName,
      email: log.admin.email,
    },
  }));
}

export async function getPendingVerificationsCount(): Promise<number> {
  return prisma.hotel.count({ where: { isVerified: false } });
}
