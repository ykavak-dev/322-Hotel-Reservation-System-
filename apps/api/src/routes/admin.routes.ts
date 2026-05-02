import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/jwt.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '../../generated/prisma';
import { rejectHotelSchema } from '@hotel/shared';

// Dashboard
import { getSystemDashboardHandler } from '../controllers/systemAdminDashboard.controller';

// Hotel management
import {
  listPendingHotelsHandler,
  listAllHotelsHandler,
  approveHotelHandler,
  rejectHotelHandler,
  getHotelDetailHandler,
} from '../controllers/adminHotels.controller';

// Review moderation
import {
  listPendingReviewsHandler,
  listReviewsHandler,
  approveReviewHandler,
  rejectReviewHandler,
  deleteReviewHandler,
} from '../controllers/adminReviews.controller';

// User management
import {
  listUsersHandler,
  updateUserRoleHandler,
  banUserHandler,
  getUserActivityHandler,
} from '../controllers/adminUser.controller';

// Bookings management
import { listAdminBookingsHandler, refundBookingHandler } from '../controllers/adminBookings.controller';

const router = Router({ mergeParams: true });

// ============ SYSTEM ADMIN DASHBOARD ============
router.get('/dashboard', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), getSystemDashboardHandler);

// ============ HOTEL MANAGEMENT ============
router.get('/hotels/pending', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listPendingHotelsHandler);
router.get('/hotels', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listAllHotelsHandler);
router.get('/hotels/:id', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), getHotelDetailHandler);
router.put('/hotels/:id/approve', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), approveHotelHandler);
router.put('/hotels/:id/reject', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), validate(rejectHotelSchema), rejectHotelHandler);

// ============ REVIEW MODERATION ============
router.get('/reviews/pending', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listPendingReviewsHandler);
router.get('/reviews', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listReviewsHandler);
router.put('/reviews/:id/approve', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), approveReviewHandler);
router.put('/reviews/:id/reject', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), rejectReviewHandler);
router.delete('/reviews/:id', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), deleteReviewHandler);

// ============ USER MANAGEMENT ============
router.get('/users', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listUsersHandler);
router.put('/users/:id/role', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), updateUserRoleHandler);
router.put('/users/:id/ban', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), banUserHandler);
router.get('/users/:id/activity', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), getUserActivityHandler);

// ============ BOOKINGS MANAGEMENT ============
router.get('/bookings', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), listAdminBookingsHandler);
router.put('/bookings/:id/refund', requireAuth, requireRole(UserRole.SYSTEM_ADMIN), refundBookingHandler);

export default router;
