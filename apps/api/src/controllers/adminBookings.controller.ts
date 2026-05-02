import type { Request, Response, NextFunction } from 'express';
import { listAdminBookings, refundBooking } from '../services/adminBookings.service';
import { sendSuccess } from '../utils/response';
import type { BookingStatus } from '../../generated/prisma';

export async function listAdminBookingsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const hotelId = req.query.hotelId as string | undefined;
    const status = req.query.status as BookingStatus | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const priceMin = req.query.priceMin ? Number(req.query.priceMin) : undefined;
    const priceMax = req.query.priceMax ? Number(req.query.priceMax) : undefined;
    const search = req.query.search as string | undefined;

    const result = await listAdminBookings({ page, limit, hotelId, status, dateFrom, dateTo, priceMin, priceMax, search });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function refundBookingHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await refundBooking(id, req.user!.id);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}
