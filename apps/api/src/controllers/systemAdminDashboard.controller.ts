import type { Request, Response, NextFunction } from 'express';
import {
  getSystemDashboard,
  getUserRegistrationTrend,
  getBookingStatusDistribution,
  getRevenueTrend,
  getTopHotelsByBookings,
  getRecentActivityLogs,
  getPendingVerificationsCount,
} from '../services/systemAdminDashboard.service';
import { sendSuccess } from '../utils/response';

export async function getSystemDashboardHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [dashboard, userTrend, statusDistribution, revenueTrend, topHotels, recentActivity, pendingCount] = await Promise.all([
      getSystemDashboard(),
      getUserRegistrationTrend(30),
      getBookingStatusDistribution(),
      getRevenueTrend(30),
      getTopHotelsByBookings(5),
      getRecentActivityLogs(20),
      getPendingVerificationsCount(),
    ]);

    sendSuccess(res, {
      ...dashboard,
      userRegistrationTrend: userTrend,
      bookingStatusDistribution: statusDistribution,
      revenueTrend,
      topHotels,
      recentActivity,
      pendingVerifications: pendingCount,
    });
  } catch (err) {
    next(err);
  }
}
