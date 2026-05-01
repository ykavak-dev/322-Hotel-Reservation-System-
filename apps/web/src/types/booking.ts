import type { BookingStatus } from '@hotel/shared';

export interface BookingDetail {
  id: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests: string | null;
  createdAt: Date;
  room: {
    id: string;
    type: string;
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
  payments: PaymentDetail[];
}

export interface PaymentDetail {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface CreateBookingData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface CancellationResult {
  booking: BookingDetail;
  refundAmount: number;
  refundPolicy: string;
}

export interface BookingResponse {
  id: string;
  confirmationNumber: string;
  status: string;
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  createdAt: string;
}
