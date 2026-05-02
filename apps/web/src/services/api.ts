import axios from 'axios';

import * as mockHandlers from '../mocks/handlers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import type {
  SearchResponse,
  AvailabilityResponse,
  ReviewListResponse,
  ProcessPaymentData,
  PaymentResult,
} from '../types/hotel';

import type {
  CreateBookingData,
  BookingResponse,
  BookingDetail,
  CancellationResult,
} from '../types/booking';

import type { AdminDashboardData, BookingFilters, AdminBookingListResponse, AdminBooking, RoomManagementItem, CreateRoomData, UpdateRoomData, HotelProfileData, UpdateHotelData } from '../types/admin';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export async function searchHotels(params: Record<string, unknown>): Promise<SearchResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockSearchHotels(params);
  }
  const { data } = await api.get<SearchResponse>('/search/hotels', { params });
  return data;
}

export async function checkAvailability(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<AvailabilityResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockCheckAvailability(hotelId, checkIn, checkOut, guests);
  }
  const { data } = await api.get<AvailabilityResponse>('/search/availability', {
    params: { hotelId, checkIn, checkOut, guests },
  });
  return data;
}

export async function getHotelReviews(
  hotelId: string,
  page = 1,
  limit = 10
): Promise<ReviewListResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetHotelReviews(hotelId, page, limit);
  }
  const { data } = await api.get<ReviewListResponse>(`/reviews/hotel/${hotelId}`, {
    params: { page, limit },
  });
  return data;
}

export async function canWriteReview(hotelId: string): Promise<{ canReview: boolean; reason?: string }> {
  if (USE_MOCK) {
    return mockHandlers.mockCanWriteReview(hotelId);
  }
  const { data } = await api.get<{ canReview: boolean; reason?: string }>('/reviews/can-review', {
    params: { hotelId },
  });
  return data;
}

export async function createBooking(data: CreateBookingData): Promise<BookingResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockCreateBooking(data);
  }
  const response = await api.post<BookingResponse>('/bookings', data);
  return response.data;
}

export async function getBooking(bookingId: string): Promise<BookingDetail> {
  if (USE_MOCK) {
    return mockHandlers.mockGetBooking(bookingId);
  }
  const { data } = await api.get<BookingDetail>(`/bookings/${bookingId}`);
  return data;
}

export async function cancelBooking(bookingId: string): Promise<CancellationResult> {
  if (USE_MOCK) {
    return mockHandlers.mockCancelBooking(bookingId);
  }
  const { data } = await api.put<CancellationResult>(`/bookings/${bookingId}/cancel`);
  return data;
}

export async function getUserBookings(): Promise<BookingDetail[]> {
  if (USE_MOCK) {
    return mockHandlers.mockGetUserBookings();
  }
  const { data } = await api.get<BookingDetail[]>('/bookings');
  return data;
}

export async function processPayment(data: ProcessPaymentData): Promise<PaymentResult> {
  if (USE_MOCK) {
    return mockHandlers.mockProcessPayment(data);
  }
  const { data: result } = await api.post<PaymentResult>('/payments/process', data);
  return result;
}

// Admin Dashboard
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  if (USE_MOCK) {
    return mockHandlers.mockGetAdminDashboard();
  }
  const { data } = await api.get<AdminDashboardData>('/hotel-admin/dashboard');
  return data;
}

// Admin Bookings
export async function getHotelAdminBookings(filters: BookingFilters = {}): Promise<AdminBookingListResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetHotelAdminBookings(filters);
  }
  const { data } = await api.get<AdminBookingListResponse>('/hotel-admin/bookings', { params: filters });
  return data;
}

export async function confirmBooking(id: string): Promise<AdminBooking> {
  if (USE_MOCK) {
    return mockHandlers.mockConfirmBooking(id);
  }
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/confirm`);
  return data;
}

export async function checkInBooking(id: string): Promise<AdminBooking> {
  if (USE_MOCK) {
    return mockHandlers.mockCheckInBooking(id);
  }
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/check-in`);
  return data;
}

export async function checkOutBooking(id: string): Promise<AdminBooking> {
  if (USE_MOCK) {
    return mockHandlers.mockCheckOutBooking(id);
  }
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/check-out`);
  return data;
}

export async function cancelBookingAdmin(id: string): Promise<AdminBooking> {
  if (USE_MOCK) {
    return mockHandlers.mockCancelBookingAdmin(id);
  }
  const { data } = await api.put<AdminBooking>(`/hotel-admin/bookings/${id}/cancel`);
  return data;
}

// Rooms
export async function getHotelRooms(hotelId: string): Promise<RoomManagementItem[]> {
  if (USE_MOCK) {
    return mockHandlers.mockGetHotelRooms(hotelId);
  }
  const { data } = await api.get<RoomManagementItem[]>(`/hotels/${hotelId}/rooms`);
  return data;
}

export async function createRoom(hotelId: string, roomData: CreateRoomData): Promise<RoomManagementItem> {
  if (USE_MOCK) {
    return mockHandlers.mockCreateRoom(hotelId, roomData);
  }
  const { data } = await api.post<RoomManagementItem>(`/hotels/${hotelId}/rooms`, roomData);
  return data;
}

export async function updateRoom(hotelId: string, roomId: string, roomData: UpdateRoomData): Promise<RoomManagementItem> {
  if (USE_MOCK) {
    return mockHandlers.mockUpdateRoom(hotelId, roomId, roomData);
  }
  const { data } = await api.put<RoomManagementItem>(`/hotels/${hotelId}/rooms/${roomId}`, roomData);
  return data;
}

export async function deleteRoom(hotelId: string, roomId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockDeleteRoom(hotelId, roomId);
  }
  await api.delete(`/hotels/${hotelId}/rooms/${roomId}`);
}

// Hotel Profile
export async function getHotelProfile(hotelId: string): Promise<HotelProfileData> {
  if (USE_MOCK) {
    return mockHandlers.mockGetHotelProfile(hotelId);
  }
  const { data } = await api.get<HotelProfileData>(`/hotels/${hotelId}`);
  return data;
}

export async function updateHotelProfile(hotelId: string, hotelData: UpdateHotelData): Promise<HotelProfileData> {
  if (USE_MOCK) {
    return mockHandlers.mockUpdateHotelProfile(hotelId, hotelData);
  }
  const { data } = await api.put<HotelProfileData>(`/hotels/${hotelId}`, hotelData);
  return data;
}

// ============ SYSTEM ADMIN ============
import type {
  SystemDashboardStats,
  UserListResponse,
  UserActivity,
  PendingHotelsResponse,
  HotelsListResponse,
  AdminHotelItem,
  SystemBookingsResponse,
  ReviewsListResponse,
  PendingReviewsResponse,
} from '../types/systemAdmin';

// Dashboard
export async function getSystemDashboard(): Promise<SystemDashboardStats> {
  if (USE_MOCK) {
    return mockHandlers.mockGetSystemDashboard();
  }
  const { data } = await api.get<SystemDashboardStats>('/admin/dashboard');
  return data;
}

// Users
export async function getSystemUsers(params: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<UserListResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetSystemUsers(params);
  }
  const { data } = await api.get<UserListResponse>('/admin/users', { params });
  return data;
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockUpdateUserRole(userId, role);
  }
  await api.put(`/admin/users/${userId}/role`, { role });
}

export async function banUser(userId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockBanUser(userId);
  }
  await api.put(`/admin/users/${userId}/ban`);
}

export async function getUserActivity(userId: string): Promise<UserActivity> {
  if (USE_MOCK) {
    return mockHandlers.mockGetUserActivity(userId);
  }
  const { data } = await api.get<UserActivity>(`/admin/users/${userId}/activity`);
  return data;
}

// Hotels
export async function getPendingHotels(): Promise<PendingHotelsResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetPendingHotels();
  }
  const { data } = await api.get<PendingHotelsResponse>('/admin/hotels/pending');
  return data;
}

export async function getAllHotels(params: {
  page?: number;
  limit?: number;
  verificationStatus?: string;
  search?: string;
}): Promise<HotelsListResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetAllHotels(params);
  }
  const { data } = await api.get<HotelsListResponse>('/admin/hotels', { params });
  return data;
}

export async function getHotelDetail(hotelId: string): Promise<AdminHotelItem> {
  if (USE_MOCK) {
    return mockHandlers.mockGetHotelDetail(hotelId);
  }
  const { data } = await api.get<AdminHotelItem>(`/admin/hotels/${hotelId}`);
  return data;
}

export async function approveHotel(hotelId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockApproveHotel(hotelId);
  }
  await api.put(`/admin/hotels/${hotelId}/approve`);
}

export async function rejectHotel(hotelId: string, reason: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockRejectHotel(hotelId, reason);
  }
  await api.put(`/admin/hotels/${hotelId}/reject`, { reason });
}

// Bookings
export async function getSystemBookings(params: {
  page?: number;
  limit?: number;
  hotelId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}): Promise<SystemBookingsResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetSystemBookings(params);
  }
  const { data } = await api.get<SystemBookingsResponse>('/admin/bookings', { params });
  return data;
}

export async function refundBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    return mockHandlers.mockRefundBooking(bookingId);
  }
  const { data } = await api.put<{ success: boolean; message: string }>(`/admin/bookings/${bookingId}/refund`);
  return data;
}

// Reviews
export async function getPendingReviews(): Promise<PendingReviewsResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetPendingReviews();
  }
  const { data } = await api.get<PendingReviewsResponse>('/admin/reviews/pending');
  return data;
}

export async function getAllReviews(params: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ReviewsListResponse> {
  if (USE_MOCK) {
    return mockHandlers.mockGetAllReviews(params);
  }
  const { data } = await api.get<ReviewsListResponse>('/admin/reviews', { params });
  return data;
}

export async function approveReview(reviewId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockApproveReview(reviewId);
  }
  await api.put(`/admin/reviews/${reviewId}/approve`);
}

export async function rejectReview(reviewId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockRejectReview(reviewId);
  }
  await api.put(`/admin/reviews/${reviewId}/reject`);
}

export async function deleteReview(reviewId: string): Promise<void> {
  if (USE_MOCK) {
    return mockHandlers.mockDeleteReview(reviewId);
  }
  await api.delete(`/admin/reviews/${reviewId}`);
}

export { queryClient } from '../lib/api/queryClient';
