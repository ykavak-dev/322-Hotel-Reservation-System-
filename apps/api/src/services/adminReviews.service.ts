import { prisma } from '../utils/db';
import { ApiError } from '../utils/ApiError';

interface AdminReviewItem {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
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

interface AdminReviewFilters {
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}

async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await prisma.adminActivityLog.create({
    data: { adminId, action, entityType, entityId, details: details as any },
  });
}

export async function listPendingReviews(): Promise<AdminReviewItem[]> {
  const reviews = await prisma.review.findMany({
    where: { isApproved: false },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      hotel: { select: { id: true, name: true, city: true, country: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    isApproved: r.isApproved,
    createdAt: r.createdAt,
    user: {
      id: r.user.id,
      email: r.user.email,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
    },
    hotel: {
      id: r.hotel.id,
      name: r.hotel.name,
      city: r.hotel.city,
      country: r.hotel.country,
    },
    bookingId: r.bookingId,
  }));
}

export async function listReviews(
  filters: AdminReviewFilters
): Promise<{ reviews: AdminReviewItem[]; total: number; page: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filters.status === 'pending') {
    where.isApproved = false;
  } else if (filters.status === 'approved') {
    where.isApproved = true;
    where.isApproved = undefined;
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        hotel: { select: { id: true, name: true, city: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      isApproved: r.isApproved,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        email: r.user.email,
        firstName: r.user.firstName,
        lastName: r.user.lastName,
      },
      hotel: {
        id: r.hotel.id,
        name: r.hotel.name,
        city: r.hotel.city,
        country: r.hotel.country,
      },
      bookingId: r.bookingId,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function approveReview(reviewId: string, adminId: string): Promise<AdminReviewItem> {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      hotel: { select: { id: true, name: true, city: true, country: true } },
    },
  });

  await logAdminAction(adminId, 'REVIEW_APPROVED', 'Review', reviewId, {
    hotelName: review.hotel.name,
    rating: review.rating,
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    isApproved: review.isApproved,
    createdAt: review.createdAt,
    user: {
      id: review.user.id,
      email: review.user.email,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
    },
    hotel: {
      id: review.hotel.id,
      name: review.hotel.name,
      city: review.hotel.city,
      country: review.hotel.country,
    },
    bookingId: review.bookingId,
  };
}

export async function rejectReview(reviewId: string, adminId: string): Promise<AdminReviewItem> {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: false },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      hotel: { select: { id: true, name: true, city: true, country: true } },
    },
  });

  await logAdminAction(adminId, 'REVIEW_REJECTED', 'Review', reviewId, {
    hotelName: review.hotel.name,
    rating: review.rating,
  });

  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    isApproved: review.isApproved,
    createdAt: review.createdAt,
    user: {
      id: review.user.id,
      email: review.user.email,
      firstName: review.user.firstName,
      lastName: review.user.lastName,
    },
    hotel: {
      id: review.hotel.id,
      name: review.hotel.name,
      city: review.hotel.city,
      country: review.hotel.country,
    },
    bookingId: review.bookingId,
  };
}

export async function deleteReview(reviewId: string, adminId: string): Promise<void> {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) {
    throw new ApiError('Review not found', 404, 'NOT_FOUND');
  }

  await prisma.review.delete({ where: { id: reviewId } });

  await logAdminAction(adminId, 'REVIEW_DELETED', 'Review', reviewId, {
    hotelName: review.hotelId,
    rating: review.rating,
  });
}
