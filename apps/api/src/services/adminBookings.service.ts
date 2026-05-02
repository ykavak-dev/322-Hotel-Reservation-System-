import { prisma } from '../utils/db';
import { ApiError } from '../utils/ApiError';
import type { BookingStatus, PaymentStatus } from '../../generated/prisma';

export interface AdminBookingListFilters {
  hotelId?: string;
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface AdminBookingItem {
  id: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests: string | null;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    type: string;
    pricePerNight: number;
    hotel: {
      id: string;
      name: string;
      city: string;
      country: string;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: string;
    paidAt: Date | null;
  }>;
}

export async function listAdminBookings(
  filters: AdminBookingListFilters
): Promise<{ bookings: AdminBookingItem[]; total: number; page: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.status) where.status = filters.status;

  if (filters.dateFrom || filters.dateTo) {
    where.checkIn = {};
    if (filters.dateFrom) (where.checkIn as Record<string, unknown>).gte = new Date(filters.dateFrom);
    if (filters.dateTo) (where.checkIn as Record<string, unknown>).lte = new Date(filters.dateTo);
  }

  if (filters.hotelId) {
    where.room = { hotelId: filters.hotelId };
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.totalPrice = {};
    if (filters.priceMin !== undefined) (where.totalPrice as Record<string, unknown>).gte = filters.priceMin;
    if (filters.priceMax !== undefined) (where.totalPrice as Record<string, unknown>).lte = filters.priceMax;
  }

  if (filters.search) {
    where.OR = [
      { id: { contains: filters.search, mode: 'insensitive' } },
      { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
      { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
      { room: { hotel: { name: { contains: filters.search, mode: 'insensitive' } } } },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        room: {
          select: {
            id: true,
            type: true,
            pricePerNight: true,
            hotel: { select: { id: true, name: true, city: true, country: true } },
          },
        },
        payments: {
          select: { id: true, amount: true, currency: true, status: true, paymentMethod: true, paidAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      numberOfGuests: b.numberOfGuests,
      totalPrice: Number(b.totalPrice),
      status: b.status,
      specialRequests: b.specialRequests,
      createdAt: b.createdAt,
      user: b.user,
      room: {
        id: b.room.id,
        type: b.room.type,
        pricePerNight: Number(b.room.pricePerNight),
        hotel: b.room.hotel,
      },
      payments: b.payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function refundBooking(bookingId: string, adminId: string): Promise<{ success: boolean; message: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: { where: { status: 'PAID' } } },
  });

  if (!booking) {
    throw new ApiError('Booking not found', 404, 'NOT_FOUND');
  }

  if (booking.payments.length === 0) {
    throw new ApiError('No paid payment found for this booking', 400, 'NO_PAID_PAYMENT');
  }

  const payment = booking.payments[0];
  if (payment.status !== 'PAID') {
    throw new ApiError('Payment is not in PAID status', 400, 'PAYMENT_NOT_PAID');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED' },
  });

  await prisma.adminActivityLog.create({
    data: {
      adminId,
      action: 'BOOKING_REFUNDED',
      entityType: 'Booking',
      entityId: bookingId,
      details: { amount: Number(payment.amount), paymentId: payment.id },
    },
  });

  return { success: true, message: 'Refund processed successfully' };
}
