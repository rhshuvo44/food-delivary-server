import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { CouponService } from './coupon.service';
import { couponValidators } from './coupon.validators';

type CreateCouponRequest = AuthenticatedValidatedRequest<typeof couponValidators.createCouponSchema>;
type UpdateCouponRequest = AuthenticatedValidatedRequest<typeof couponValidators.updateCouponSchema>;
type DeleteCouponRequest = AuthenticatedValidatedRequest<typeof couponValidators.deleteCouponSchema>;
type ApplyCouponRequest = AuthenticatedValidatedRequest<typeof couponValidators.applyCouponSchema>;

export class CouponController {
  static createCoupon = async (
    req: CreateCouponRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const coupon = await CouponService.createCoupon(req.user!, req.body);
      res.status(201).json(successResponse(coupon, 'Coupon created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateCoupon = async (
    req: UpdateCouponRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const coupon = await CouponService.updateCoupon(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(coupon, 'Coupon updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteCoupon = async (
    req: DeleteCouponRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await CouponService.deleteCoupon(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Coupon deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static applyCoupon = async (
    req: ApplyCouponRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await CouponService.applyCoupon(req.body);
      res.status(200).json(successResponse(result, 'Coupon applied successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
