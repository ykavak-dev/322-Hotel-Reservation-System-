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
    prisma.booking.count({
      where: {
        room: { hotelId: { in: hotelIds } },
        createdAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
    prisma.booking.count({
      where: {
        room: { hotelId: { in: hotelIds } },
        status: 'CONFIRMED',
        checkIn: { gte: startOfToday, lt: endOfToday },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth },
        booking: { room: { hotelId: { in: hotelIds } } },
      },
      _sum: { amount: true },
    }),
    prisma.room.findMany({
      where: { hotelId: { in: hotelIds }, isActive: true },
      select: { id: true, totalQuantity: true },
    }),
    prisma.booking.findMany({
      where: {
        room: { hotelId: { in: hotelIds } },
        createdAt: { gte: last7Days[0], lt: endOfToday },
      },
      select: { createdAt: true },
    }),
    prisma.booking.findMany({
      where: {
        room: { hotelId: { in: hotelIds } },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: startOfMonth },
      },
      include: { room: { select: { type: true } } },
    }),
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

  // Calculate occupied rooms for today
  const confirmedOrCompletedBookings = await prisma.booking.findMany({
    where: {
      room: { hotelId: { in: hotelIds } },
      status: { in: ['CONFIRMED', 'COMPLETED'] },
      checkIn: { lt: endOfToday },
      checkOut: { gt: startOfToday },
    },
    select: { roomId: true },
  });

  const occupiedRoomIds = new Set(confirmedOrCompletedBookings.map((b) => b.roomId));
  const totalRooms = allRooms.reduce((sum, r) => sum + r.totalQuantity, 0);
  const occupiedRooms = occupiedRoomIds.size;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const bookingsByDate = last7Days.map((day) => {
    const dayStr = day.toISOString().split('T')[0];
    const count = bookingsLast7Days.filter(
      (b) => b.createdAt.toISOString().split('T')[0] === dayStr
    ).length;
    return { date: dayStr, count };
  });

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