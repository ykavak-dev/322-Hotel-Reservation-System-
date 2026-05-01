// Shared types for shallow tests — avoids Prisma import issues

export type UserRole = 'CUSTOMER' | 'HOTEL_ADMIN' | 'SYSTEM_ADMIN';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'SUITE' | 'DELUXE' | 'STANDARD';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
