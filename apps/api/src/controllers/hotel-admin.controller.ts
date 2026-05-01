import type { Request, Response, NextFunction } from 'express';
import { getHotelAdminBookings, confirmBooking, checkInBooking, checkOutBooking, BookingFilters } from '../services/booking.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export async function getHotelAdminBookingsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORITY');
    }

    if (req.user.role !== 'HOTEL_ADMIN' && req.user.role !== 'SYSTEM_ADMIN') {
      throw new ApiError('Forbidden', 403, 'FORBIDDEN');
    }

    const filters: BookingFilters = {
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      roomType: req.query.roomType as string,
      guestName: req.query.guestName as string,
      page: Math.max(1, Number(req.query.page ?? 1)),
      limit: Math.min(100, Math.max(1, Number(req.query.limit ?? 10))),
    };
    const result = await getHotelAdminBookings(req.user.id, filters);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function confirmBookingHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const booking = await confirmBooking(id, req.user.id);
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
}

export async function checkInBookingHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const booking = await checkInBooking(id, req.user.id);
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
}

export async function checkOutBookingHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const { id } = req.params;
    const booking = await checkOutBooking(id, req.user.id);
    sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
}
