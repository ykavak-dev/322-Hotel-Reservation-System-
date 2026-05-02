import type { BookingStatus, RoomType, PaymentStatus, UserRole } from '@hotel/shared';

// Re-export for convenience
export type { UserRole, BookingStatus };

// ============ DASHBOARD ============
export interface KPITrend {
  value: number;
  percentChange: number;
}

export interface SystemDashboardStats {
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
  userRegistrationTrend: Array<{ date: string; count: number }>;
  bookingStatusDistribution: Array<{ status: BookingStatus; count: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  topHotels: Array<{
    id: string;
    name: string;
    city: string;
    country: string;
    bookingCount: number;
    averageRating: number | null;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, unknown> | null;
    createdAt: string;
    admin: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  pendingVerifications: number;
}

// ============ USERS ============
export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  _count: { bookings: number };
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserActivity {
  bookings: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    status: BookingStatus;
    totalPrice: number;
    hotelName: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    hotelName: string;
    createdAt: string;
  }>;
  totalBookings: number;
  totalReviews: number;
}

// ============ HOTELS ============
export interface HotelOwnerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export interface PendingHotelItem {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  starRating: number | null;
  amenities: string[];
  images: string[];
  createdAt: string;
  owner: HotelOwnerInfo;
}

export interface RoomInfo {
  id: string;
  type: RoomType;
  description: string | null;
  pricePerNight: number;
  capacity: number;
  bedType: string | null;
  roomSize: number | null;
  amenities: string[];
  images: string[];
  totalQuantity: number;
  isActive: boolean;
}

export interface AdminHotelItem {
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
  createdAt: string;
  owner: HotelOwnerInfo;
  roomCount: number;
  rooms: RoomInfo[];
}

export interface PendingHotelsResponse {
  hotels: PendingHotelItem[];
}

export interface HotelsListResponse {
  hotels: AdminHotelItem[];
  total: number;
  page: number;
  totalPages: number;
}

// ============ BOOKINGS ============
export interface SystemAdminBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    type: RoomType;
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
    paidAt: string | null;
  }>;
}

export interface SystemBookingsResponse {
  bookings: SystemAdminBooking[];
  total: number;
  page: number;
  totalPages: number;
}

// ============ REVIEWS ============
export interface AdminReviewItem {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  hotel: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
  bookingId: string;
}

export interface ReviewsListResponse {
  reviews: AdminReviewItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PendingReviewsResponse {
  reviews: AdminReviewItem[];
}
