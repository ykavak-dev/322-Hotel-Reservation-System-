import type { Request, Response, NextFunction } from 'express';
import { getHotelAdminDashboard } from '../services/hotel-admin-dashboard.service';
import { sendSuccess } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export async function getHotelAdminDashboardHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }
    const dashboard = await getHotelAdminDashboard(req.user.id);
    sendSuccess(res, dashboard);
  } catch (err) {
    next(err);
  }
}