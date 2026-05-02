import type { SearchResponse, AvailabilityResponse, ReviewListResponse } from '../types/hotel';
import type { CreateBookingData, BookingResponse, BookingDetail, CancellationResult } from '../types/booking';
import type { ProcessPaymentData, PaymentResult } from '../types/hotel';
import type { AdminDashboardData, BookingFilters, AdminBookingListResponse, AdminBooking, RoomManagementItem, CreateRoomData, UpdateRoomData, HotelProfileData, UpdateHotelData } from '../types/admin';
import type { SystemDashboardStats, UserListResponse, UserActivity, PendingHotelsResponse, HotelsListResponse, AdminHotelItem, SystemBookingsResponse, ReviewsListResponse, PendingReviewsResponse } from '../types/systemAdmin';

import { mockHotels, mockRooms, mockReviews, mockBookings, mockAdminDashboard, mockSystemDashboard, mockHotelRooms } from './data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ HOTEL SEARCH & DETAILS ============

export async function mockSearchHotels(params: Record<string, unknown>): Promise<SearchResponse> {
  await delay(300);
  return {
    hotels: mockHotels,
    total: mockHotels.length,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
  };
}

export async function mockCheckAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<AvailabilityResponse> {
  await delay(300);
  const hotel = mockHotels.find(h => h.id === hotelId);
  const rooms = mockRooms[hotelId] || [];

  return {
    hotelId,
    hotelName: hotel?.name || 'Unknown Hotel',
    checkIn,
    checkOut,
    guests,
    availableRooms: rooms.filter(room => room.capacity >= guests),
  };
}

export async function mockGetHotelReviews(
  hotelId: string,
  page = 1,
  limit = 10
): Promise<ReviewListResponse> {
  await delay(300);
  const reviews = mockReviews[hotelId] || [];
  const total = reviews.length;
  const totalPages = Math.ceil(total / limit);

  return {
    reviews,
    total,
    page,
    totalPages,
  };
}

export async function mockCanWriteReview(hotelId: string): Promise<{ canReview: boolean; reason?: string }> {
  await delay(200);
  // For mock purposes, assume user can review
  return { canReview: true };
}

// ============ BOOKINGS ============

export async function mockCreateBooking(data: CreateBookingData): Promise<BookingResponse> {
  await delay(400);
  return {
    id: `booking-mock-${Date.now()}`,
    confirmationNumber: `CONF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: 'confirmed',
    hotelId: 'hotel-001',
    roomTypeId: data.roomId,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    totalPrice: 399,
    createdAt: new Date().toISOString(),
  };
}

export async function mockGetBooking(bookingId: string): Promise<BookingDetail> {
  await delay(300);
  const booking = mockBookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  return booking;
}

export async function mockCancelBooking(bookingId: string): Promise<CancellationResult> {
  await delay(400);
  const booking = mockBookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  return {
    booking,
    refundAmount: booking.totalPrice,
    refundPolicy: 'Full refund if cancelled 24+ hours before check-in',
  };
}

export async function mockGetUserBookings(): Promise<BookingDetail[]> {
  await delay(300);
  return mockBookings;
}

export async function mockProcessPayment(data: ProcessPaymentData): Promise<PaymentResult> {
  await delay(500);
  return {
    success: true,
    transactionId: `txn_mock_${Date.now()}`,
    amount: 399,
    paymentMethod: data.paymentMethod,
    cardLast4: '4242',
  };
}

// ============ HOTEL ADMIN ============

export async function mockGetAdminDashboard(): Promise<AdminDashboardData> {
  await delay(300);
  return mockAdminDashboard;
}

export async function mockGetHotelAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingListResponse> {
  await delay(300);
  // Convert mockBookings to AdminBooking format
  const adminBookings: AdminBooking[] = mockBookings.map((booking, index) => ({
    id: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    numberOfGuests: booking.numberOfGuests,
    totalPrice: booking.totalPrice,
    status: booking.status,
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt,
    confirmationNumber: `CONF-${(1000 + index).toString()}`,
    room: {
      id: booking.room.id,
      type: booking.room.type as import('@hotel/shared').RoomType,
      description: booking.room.description,
      pricePerNight: booking.room.pricePerNight,
      capacity: booking.room.capacity,
      bedType: booking.room.bedType,
      amenities: booking.room.amenities,
      images: booking.room.images,
      hotel: booking.room.hotel,
    },
    payments: booking.payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      paymentMethod: p.paymentMethod,
      status: p.status,
      transactionId: p.transactionId,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
    })),
    user: {
      firstName: 'Guest',
      lastName: 'User',
      email: 'guest@example.com',
    },
  }));

  return {
    bookings: adminBookings,
    total: adminBookings.length,
    page: 1,
    totalPages: 1,
  };
}

export async function mockConfirmBooking(id: string): Promise<AdminBooking> {
  await delay(300);
  return mockGetHotelAdminBookings().then(response =>
    response.bookings.find(b => b.id === id) || response.bookings[0]
  );
}

export async function mockCheckInBooking(id: string): Promise<AdminBooking> {
  await delay(300);
  return mockGetHotelAdminBookings().then(response =>
    response.bookings.find(b => b.id === id) || response.bookings[0]
  );
}

export async function mockCheckOutBooking(id: string): Promise<AdminBooking> {
  await delay(300);
  return mockGetHotelAdminBookings().then(response =>
    response.bookings.find(b => b.id === id) || response.bookings[0]
  );
}

export async function mockCancelBookingAdmin(id: string): Promise<AdminBooking> {
  await delay(300);
  return mockGetHotelAdminBookings().then(response =>
    response.bookings.find(b => b.id === id) || response.bookings[0]
  );
}

export async function mockGetHotelRooms(hotelId: string): Promise<RoomManagementItem[]> {
  await delay(300);
  return mockHotelRooms.filter(room => room.hotelId === hotelId);
}

export async function mockCreateRoom(hotelId: string, roomData: CreateRoomData): Promise<RoomManagementItem> {
  await delay(400);
  return {
    id: `room-${Date.now()}`,
    hotelId,
    type: roomData.type,
    description: roomData.description || null,
    pricePerNight: roomData.pricePerNight,
    capacity: roomData.capacity,
    bedType: roomData.bedType || null,
    roomSize: roomData.roomSize || null,
    amenities: roomData.amenities || [],
    images: roomData.images || [],
    totalQuantity: roomData.totalQuantity,
    availableQuantity: roomData.totalQuantity,
  };
}

export async function mockUpdateRoom(hotelId: string, roomId: string, roomData: UpdateRoomData): Promise<RoomManagementItem> {
  await delay(400);
  const existingRoom = mockHotelRooms.find(r => r.id === roomId);
  return {
    id: roomId,
    hotelId,
    type: existingRoom?.type || 'SINGLE',
    description: roomData.description !== undefined ? roomData.description : existingRoom?.description || null,
    pricePerNight: roomData.pricePerNight ?? existingRoom?.pricePerNight ?? 0,
    capacity: roomData.capacity ?? existingRoom?.capacity ?? 1,
    bedType: roomData.bedType !== undefined ? roomData.bedType : existingRoom?.bedType || null,
    roomSize: roomData.roomSize !== undefined ? roomData.roomSize : existingRoom?.roomSize || null,
    amenities: roomData.amenities ?? existingRoom?.amenities ?? [],
    images: roomData.images ?? existingRoom?.images ?? [],
    totalQuantity: roomData.totalQuantity ?? existingRoom?.totalQuantity ?? 1,
    availableQuantity: existingRoom?.availableQuantity ?? 1,
  };
}

export async function mockDeleteRoom(hotelId: string, roomId: string): Promise<void> {
  await delay(300);
  // Mock implementation - in real scenario this would delete the room
  return Promise.resolve();
}

export async function mockGetHotelProfile(hotelId: string): Promise<HotelProfileData> {
  await delay(300);
  const hotel = mockHotels.find(h => h.id === hotelId);
  if (!hotel) {
    throw new Error('Hotel not found');
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
    isVerified: true,
  };
}

export async function mockUpdateHotelProfile(hotelId: string, hotelData: UpdateHotelData): Promise<HotelProfileData> {
  await delay(400);
  const currentProfile = await mockGetHotelProfile(hotelId);
  return {
    ...currentProfile,
    name: hotelData.name ?? currentProfile.name,
    description: hotelData.description ?? currentProfile.description,
    address: hotelData.address ?? currentProfile.address,
    city: hotelData.city ?? currentProfile.city,
    country: hotelData.country ?? currentProfile.country,
    starRating: hotelData.starRating ?? currentProfile.starRating,
    amenities: hotelData.amenities ?? currentProfile.amenities,
    images: hotelData.images ?? currentProfile.images,
  };
}

// ============ SYSTEM ADMIN ============

export async function mockGetSystemDashboard(): Promise<SystemDashboardStats> {
  await delay(300);
  return mockSystemDashboard;
}

export async function mockGetSystemUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
} = {}): Promise<UserListResponse> {
  await delay(300);
  // Return mock users
  const mockUsers = [
    {
      id: 'user-001',
      email: 'sarah.johnson@email.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'CUSTOMER' as const,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      _count: { bookings: 5 },
    },
    {
      id: 'user-002',
      email: 'michael.chen@email.com',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'CUSTOMER' as const,
      isActive: true,
      createdAt: '2024-02-20T14:30:00Z',
      _count: { bookings: 3 },
    },
    {
      id: 'user-003',
      email: 'hotel.owner@email.com',
      firstName: 'Hotel',
      lastName: 'Owner',
      role: 'HOTEL_ADMIN' as const,
      isActive: true,
      createdAt: '2024-01-01T09:00:00Z',
      _count: { bookings: 0 },
    },
    {
      id: 'user-004',
      email: 'system.admin@email.com',
      firstName: 'System',
      lastName: 'Admin',
      role: 'SYSTEM_ADMIN' as const,
      isActive: true,
      createdAt: '2023-12-01T08:00:00Z',
      _count: { bookings: 0 },
    },
  ];

  let filteredUsers = [...mockUsers];
  if (params.role) {
    filteredUsers = filteredUsers.filter(u => u.role === params.role);
  }
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.email.toLowerCase().includes(searchLower) ||
      u.firstName.toLowerCase().includes(searchLower) ||
      u.lastName.toLowerCase().includes(searchLower)
    );
  }

  return {
    users: filteredUsers,
    total: filteredUsers.length,
    page: params.page || 1,
    totalPages: 1,
  };
}

export async function mockUpdateUserRole(userId: string, role: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockBanUser(userId: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockGetUserActivity(userId: string): Promise<UserActivity> {
  await delay(300);
  return {
    bookings: [
      {
        id: 'booking-001',
        checkIn: '2024-04-15',
        checkOut: '2024-04-20',
        status: 'completed' as const,
        totalPrice: 1995,
        hotelName: 'Sunset Beach Resort & Spa',
      },
    ],
    reviews: [
      {
        id: 'review-001-1',
        rating: 5,
        comment: 'Absolutely stunning resort!',
        isApproved: true,
        hotelName: 'Sunset Beach Resort & Spa',
        createdAt: '2024-03-15T10:30:00Z',
      },
    ],
    totalBookings: 5,
    totalReviews: 3,
  };
}

export async function mockGetPendingHotels(): Promise<PendingHotelsResponse> {
  await delay(300);
  return {
    hotels: [
      {
        id: 'hotel-pending-001',
        name: 'New Beach Resort',
        address: '123 Beach Road',
        city: 'Miami',
        country: 'USA',
        description: 'A beautiful new resort on Miami Beach',
        starRating: 4,
        amenities: ['Free WiFi', 'Pool', 'Spa'],
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        createdAt: '2024-05-01T10:00:00Z',
        owner: {
          id: 'owner-001',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@email.com',
          phone: '+1-555-0123',
        },
      },
    ],
  };
}

export async function mockGetAllHotels(params: {
  page?: number;
  limit?: number;
  verificationStatus?: string;
  search?: string;
} = {}): Promise<HotelsListResponse> {
  await delay(300);
  const adminHotels: AdminHotelItem[] = mockHotels.map(hotel => ({
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.starRating,
    amenities: hotel.amenities,
    images: hotel.images,
    isVerified: true,
    rejectionReason: null,
    averageRating: hotel.averageRating,
    createdAt: '2024-01-01T00:00:00Z',
    owner: {
      id: 'owner-001',
      firstName: 'Hotel',
      lastName: 'Owner',
      email: 'owner@hotel.com',
      phone: null,
    },
    roomCount: 4,
    rooms: [],
  }));

  return {
    hotels: adminHotels,
    total: adminHotels.length,
    page: params.page || 1,
    totalPages: 1,
  };
}

export async function mockGetHotelDetail(hotelId: string): Promise<AdminHotelItem> {
  await delay(300);
  const hotel = mockHotels.find(h => h.id === hotelId);
  if (!hotel) {
    throw new Error('Hotel not found');
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
    isVerified: true,
    rejectionReason: null,
    averageRating: hotel.averageRating,
    createdAt: '2024-01-01T00:00:00Z',
    owner: {
      id: 'owner-001',
      firstName: 'Hotel',
      lastName: 'Owner',
      email: 'owner@hotel.com',
      phone: null,
    },
    roomCount: 4,
    rooms: [],
  };
}

export async function mockApproveHotel(hotelId: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockRejectHotel(hotelId: string, reason: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockGetSystemBookings(params: {
  page?: number;
  limit?: number;
  hotelId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
} = {}): Promise<SystemBookingsResponse> {
  await delay(300);
  const systemBookings = mockBookings.map(booking => ({
    id: booking.id,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    numberOfGuests: booking.numberOfGuests,
    totalPrice: booking.totalPrice,
    status: booking.status,
    specialRequests: booking.specialRequests,
    createdAt: booking.createdAt.toISOString(),
    user: {
      id: 'user-001',
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'User',
    },
    room: {
      id: booking.room.id,
      type: booking.room.type as import('@hotel/shared').RoomType,
      pricePerNight: booking.room.pricePerNight,
      hotel: {
        id: booking.room.hotel.id,
        name: booking.room.hotel.name,
        city: booking.room.hotel.city,
        country: booking.room.hotel.country,
      },
    },
    payments: booking.payments.map(p => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: 'paid' as const,
      paymentMethod: p.paymentMethod,
      paidAt: p.paidAt?.toISOString() || null,
    })),
  }));

  return {
    bookings: systemBookings,
    total: systemBookings.length,
    page: params.page || 1,
    totalPages: 1,
  };
}

export async function mockRefundBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  return {
    success: true,
    message: 'Refund processed successfully',
  };
}

export async function mockGetPendingReviews(): Promise<PendingReviewsResponse> {
  await delay(300);
  return {
    reviews: [
      {
        id: 'review-pending-001',
        rating: 4,
        comment: 'Great hotel but could use better pillows.',
        isApproved: false,
        createdAt: '2024-05-01T10:00:00Z',
        user: {
          id: 'user-001',
          email: 'guest@example.com',
          firstName: 'Guest',
          lastName: 'User',
        },
        hotel: {
          id: 'hotel-001',
          name: 'Sunset Beach Resort & Spa',
          city: 'Maui',
          country: 'USA',
        },
        bookingId: 'booking-001',
      },
    ],
  };
}

export async function mockGetAllReviews(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<ReviewsListResponse> {
  await delay(300);
  const allReviews = Object.values(mockReviews).flat();
  return {
    reviews: allReviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
      user: {
        id: r.userId,
        email: 'guest@example.com',
        firstName: r.user?.firstName || 'Guest',
        lastName: r.user?.lastName || 'User',
      },
      hotel: {
        id: r.hotelId,
        name: 'Hotel',
        city: 'City',
        country: 'Country',
      },
      bookingId: r.bookingId,
    })),
    total: allReviews.length,
    page: params.page || 1,
    totalPages: 1,
  };
}

export async function mockApproveReview(reviewId: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockRejectReview(reviewId: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}

export async function mockDeleteReview(reviewId: string): Promise<void> {
  await delay(300);
  return Promise.resolve();
}
