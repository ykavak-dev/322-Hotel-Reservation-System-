import { prisma } from '../utils/db';
import { ApiError } from '../utils/ApiError';

export interface AdminHotelListFilters {
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

interface HotelOwnerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface RoomInfo {
  id: string;
  type: string;
  description: string | null;
  pricePerNight: number;
  capacity: number;
  totalQuantity: number;
  isActive: boolean;
}

interface AdminHotelItem {
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
  rejectionReason: string | null;
  averageRating: number | null;
  createdAt: Date;
  owner: HotelOwnerInfo;
  roomCount: number;
  rooms: RoomInfo[];
}

interface PendingHotelItem {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  starRating: number | null;
  amenities: string[];
  images: string[];
  createdAt: Date;
  owner: HotelOwnerInfo;
}

async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await prisma.adminActivityLog.create({
    data: { adminId, action, entityType, entityId, details: details as any },
  });
}

export async function listPendingHotels(): Promise<PendingHotelItem[]> {
  const hotels = await prisma.hotel.findMany({
    where: { isVerified: false },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return hotels.map((h) => ({
    id: h.id,
    name: h.name,
    description: h.description,
    address: h.address,
    city: h.city,
    country: h.country,
    starRating: h.starRating,
    amenities: h.amenities,
    images: h.images,
    createdAt: h.createdAt,
    owner: {
      id: h.owner.id,
      firstName: h.owner.firstName,
      lastName: h.owner.lastName,
      email: h.owner.email,
      phone: h.owner.phone,
    },
  }));
}

export async function listAllHotels(
  filters: AdminHotelListFilters
): Promise<{ hotels: AdminHotelItem[]; total: number; page: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filters.verificationStatus === 'verified') {
    where.isVerified = true;
  } else if (filters.verificationStatus === 'pending') {
    where.isVerified = false;
  } else if (filters.verificationStatus === 'rejected') {
    where.isVerified = false;
    where.rejectionReason = { not: null };
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { city: { contains: filters.search, mode: 'insensitive' } },
      { country: { contains: filters.search, mode: 'insensitive' } },
      { owner: { email: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        rooms: { select: { id: true, type: true, description: true, pricePerNight: true, capacity: true, totalQuantity: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.hotel.count({ where }),
  ]);

  return {
    hotels: hotels.map((h) => ({
      id: h.id,
      name: h.name,
      description: h.description,
      address: h.address,
      city: h.city,
      country: h.country,
      starRating: h.starRating,
      amenities: h.amenities,
      images: h.images,
      isVerified: h.isVerified,
      rejectionReason: h.rejectionReason,
      averageRating: h.averageRating,
      createdAt: h.createdAt,
      owner: {
        id: h.owner.id,
        firstName: h.owner.firstName,
        lastName: h.owner.lastName,
        email: h.owner.email,
        phone: h.owner.phone,
      },
      roomCount: h.rooms.length,
      rooms: h.rooms.map((r) => ({
        ...r,
        pricePerNight: Number(r.pricePerNight),
      })),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approveHotel(hotelId: string, adminId: string): Promise<AdminHotelItem> {
  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: { isVerified: true, rejectionReason: null },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      rooms: { select: { id: true, type: true, description: true, pricePerNight: true, capacity: true, totalQuantity: true, isActive: true } },
    },
  });

  await logAdminAction(adminId, 'HOTEL_APPROVED', 'Hotel', hotelId, { hotelName: hotel.name });

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.starRating,
    amenities: hotel.amenities,
    images: hotel.images,
    isVerified: hotel.isVerified,
    rejectionReason: hotel.rejectionReason,
    averageRating: hotel.averageRating,
    createdAt: hotel.createdAt,
    owner: {
      id: hotel.owner.id,
      firstName: hotel.owner.firstName,
      lastName: hotel.owner.lastName,
      email: hotel.owner.email,
      phone: hotel.owner.phone,
    },
    roomCount: hotel.rooms.length,
    rooms: hotel.rooms.map((r) => ({
      ...r,
      pricePerNight: Number(r.pricePerNight),
    })),
  };
}

export async function rejectHotel(
  hotelId: string,
  reason: string,
  adminId: string
): Promise<AdminHotelItem> {
  const hotel = await prisma.hotel.update({
    where: { id: hotelId },
    data: { isVerified: false, rejectionReason: reason },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      rooms: { select: { id: true, type: true, description: true, pricePerNight: true, capacity: true, totalQuantity: true, isActive: true } },
    },
  });

  await logAdminAction(adminId, 'HOTEL_REJECTED', 'Hotel', hotelId, { hotelName: hotel.name, reason });

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.starRating,
    amenities: hotel.amenities,
    images: hotel.images,
    isVerified: hotel.isVerified,
    rejectionReason: hotel.rejectionReason,
    averageRating: hotel.averageRating,
    createdAt: hotel.createdAt,
    owner: {
      id: hotel.owner.id,
      firstName: hotel.owner.firstName,
      lastName: hotel.owner.lastName,
      email: hotel.owner.email,
      phone: hotel.owner.phone,
    },
    roomCount: hotel.rooms.length,
    rooms: hotel.rooms.map((r) => ({
      ...r,
      pricePerNight: Number(r.pricePerNight),
    })),
  };
}

export async function getHotelDetail(hotelId: string): Promise<AdminHotelItem> {
  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      rooms: { select: { id: true, type: true, description: true, pricePerNight: true, capacity: true, totalQuantity: true, isActive: true } },
    },
  });

  if (!hotel) {
    throw new ApiError('Hotel not found', 404, 'NOT_FOUND');
  }

  return {
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.starRating,
    amenities: hotel.amenities,
    images: hotel.images,
    isVerified: hotel.isVerified,
    rejectionReason: hotel.rejectionReason,
    averageRating: hotel.averageRating,
    createdAt: hotel.createdAt,
    owner: {
      id: hotel.owner.id,
      firstName: hotel.owner.firstName,
      lastName: hotel.owner.lastName,
      email: hotel.owner.email,
      phone: hotel.owner.phone,
    },
    roomCount: hotel.rooms.length,
    rooms: hotel.rooms.map((r) => ({
      ...r,
      pricePerNight: Number(r.pricePerNight),
    })),
  };
}
