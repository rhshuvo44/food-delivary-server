import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { ReviewService } from './review.service';

export class ReviewController {
    static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const review = await ReviewService.createReview(req.user!, req.body);
            res.status(201).json(successResponse(review, 'Review created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const review = await ReviewService.updateReview(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(review, 'Review updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await ReviewService.deleteReview(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Review deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
