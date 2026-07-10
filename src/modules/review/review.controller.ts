import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { ReviewService } from './review.service';
import { reviewValidators } from './review.validators';

type CreateReviewRequest = AuthenticatedValidatedRequest<
  typeof reviewValidators.createReviewSchema
>;
type UpdateReviewRequest = AuthenticatedValidatedRequest<
  typeof reviewValidators.updateReviewSchema
>;
type DeleteReviewRequest = AuthenticatedValidatedRequest<
  typeof reviewValidators.deleteReviewSchema
>;

export class ReviewController {
  static createReview = async (
    req: CreateReviewRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const review = await ReviewService.createReview(req.user!, req.body);
      res.status(201).json(successResponse(review, 'Review created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateReview = async (
    req: UpdateReviewRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const review = await ReviewService.updateReview(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(review, 'Review updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteReview = async (
    req: DeleteReviewRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await ReviewService.deleteReview(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Review deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
