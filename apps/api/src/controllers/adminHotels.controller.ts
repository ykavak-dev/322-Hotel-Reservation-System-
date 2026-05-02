import type { Request, Response, NextFunction } from 'express';
import { listPendingHotels, listAllHotels, approveHotel, rejectHotel, getHotelDetail } from '../services/adminHotels.service';
import { sendSuccess } from '../utils/response';

export async function listPendingHotelsHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hotels = await listPendingHotels();
    sendSuccess(res, { hotels });
  } catch (err) {
    next(err);
  }
}

export async function listAllHotelsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const verificationStatus = req.query.verificationStatus as 'verified' | 'pending' | 'rejected' | undefined;
    const search = req.query.search as string | undefined;
    const result = await listAllHotels({ page, limit, verificationStatus, search });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function approveHotelHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const hotel = await approveHotel(id, req.user!.id);
    sendSuccess(res, hotel);
  } catch (err) {
    next(err);
  }
}

export async function rejectHotelHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const hotel = await rejectHotel(id, reason, req.user!.id);
    sendSuccess(res, hotel);
  } catch (err) {
    next(err);
  }
}

export async function getHotelDetailHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const hotel = await getHotelDetail(id);
    sendSuccess(res, hotel);
  } catch (err) {
    next(err);
  }
}
