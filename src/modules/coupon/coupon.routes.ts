import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { Router } from 'express';
import { CouponController } from './coupon.controller';
import { couponPermissions } from './coupon.rbac';
import { couponValidators } from './coupon.validators';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(couponPermissions.createCoupon),
    validateRequest(couponValidators.createCouponSchema),
    asyncHandler(CouponController.createCoupon),
);

router.post(
    '/apply',
    authenticate,
    authorize(couponPermissions.applyCoupon),
    validateRequest(couponValidators.applyCouponSchema),
    asyncHandler(CouponController.applyCoupon),
);

router.put(
    '/:id',
    authenticate,
    authorize(couponPermissions.updateCoupon),
    validateRequest(couponValidators.updateCouponSchema),
    asyncHandler(CouponController.updateCoupon),
);

router.delete(
    '/:id',
    authenticate,
    authorize(couponPermissions.deleteCoupon),
    validateRequest(couponValidators.deleteCouponSchema),
    asyncHandler(CouponController.deleteCoupon),
);

export const couponRoutes = router
