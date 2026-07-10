import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { Router } from 'express';
import { ReviewController } from './review.controller';
import { reviewPermissions } from './review.rbac';
import { reviewValidators } from './review.validators';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(reviewPermissions.createReview),
  validateRequest(reviewValidators.createReviewSchema),
  asyncHandler(ReviewController.createReview)
);

router.put(
  '/:id',
  authenticate,
  authorize(reviewPermissions.updateReview),
  validateRequest(reviewValidators.updateReviewSchema),
  asyncHandler(ReviewController.updateReview)
);

router.delete(
  '/:id',
  authenticate,
  authorize(reviewPermissions.deleteReview),
  validateRequest(reviewValidators.deleteReviewSchema),
  asyncHandler(ReviewController.deleteReview)
);

export const reviewRoutes = router;
