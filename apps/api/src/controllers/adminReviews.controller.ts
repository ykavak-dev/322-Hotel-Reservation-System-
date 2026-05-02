import type { Request, Response, NextFunction } from 'express';
import { listPendingReviews, listReviews, approveReview, rejectReview, deleteReview } from '../services/adminReviews.service';
import { sendSuccess } from '../utils/response';

export async function listPendingReviewsHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reviews = await listPendingReviews();
    sendSuccess(res, { reviews });
  } catch (err) {
    next(err);
  }
}

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const result = await listReviews({ page, limit, status });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function approveReviewHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const review = await approveReview(id, req.user!.id);
    sendSuccess(res, review);
  } catch (err) {
    next(err);
  }
}

export async function rejectReviewHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const review = await rejectReview(id, req.user!.id);
    sendSuccess(res, review);
  } catch (err) {
    next(err);
  }
}

export async function deleteReviewHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await deleteReview(id, req.user!.id);
    sendSuccess(res, { message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}
