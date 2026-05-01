import { MockPrismaClient } from './mockPrisma';
import { hash } from 'bcryptjs';
import { addDays } from 'date-fns';

type UserRole = 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN';
type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'STANDARD';
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export async function createTestUser(
  prisma: MockPrismaClient,
  overrides: Partial<{
    email: string; password: string; firstName: string; lastName: string; role: UserRole;
  }> = {}
) {
  const email = overrides.email ?? `test-${Date.now()}-${Math.random()}@example.com`;
  const password = overrides.password ?? 'TestPassword123!';
  const passwordHash = await hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: overrides.firstName ?? 'Test',
      lastName: overrides.lastName ?? 'User',
      role: overrides.role ?? 'CUSTOMER',
      isActive: true,
    },
  });
}

export async function createTestHotel(
  prisma: MockPrismaClient,
  ownerId: string,
  overrides: Partial<{
    name: string; city: string; country: string; isVerified: boolean;
  }> = {}
) {
  return prisma.hotel.create({
    data: {
      name: overrides.name ?? 'Test Hotel',
      address: '123 Test Street',
      city: overrides.city ?? 'Istanbul',
      country: overrides.country ?? 'Turkey',
      amenities: ['wifi', 'pool'],
      images: ['https://example.com/hotel.jpg'],
      isVerified: overrides.isVerified ?? false,
      ownerId,
    },
  });
}

export async function createTestRoom(
  prisma: MockPrismaClient,
  hotelId: string,
  overrides: Partial<{
    type: RoomType; pricePerNight: number; totalQuantity: number;
  }> = {}
) {
  return prisma.room.create({
    data: {
      hotelId,
      type: overrides.type ?? 'SINGLE',
      description: 'A nice test room',
      pricePerNight: overrides.pricePerNight ?? 100,
      capacity: 2,
      bedType: 'Queen',
      amenities: ['wifi', 'ac'],
      images: ['https://example.com/room.jpg'],
      totalQuantity: overrides.totalQuantity ?? 5,
      isActive: true,
    },
  });
}

export async function createTestBooking(
  prisma: MockPrismaClient,
  userId: string,
  roomId: string,
  overrides: Partial<{
    checkIn: Date; checkOut: Date; status: BookingStatus; numberOfGuests: number;
  }> = {}
) {
  const checkIn = overrides.checkIn ?? addDays(new Date(), 1);
  const checkOut = overrides.checkOut ?? addDays(new Date(), 3);

  return prisma.booking.create({
    data: {
      userId,
      roomId,
      checkIn,
      checkOut,
      numberOfGuests: overrides.numberOfGuests ?? 2,
      totalPrice: 200,
      status: overrides.status ?? 'CONFIRMED',
    },
  });
}
