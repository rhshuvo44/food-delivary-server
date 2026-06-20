import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { CouponService } from './coupon.service';

export class CouponController {
    static async createCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupon = await CouponService.createCoupon(req.user!, req.body);
            res.status(201).json(successResponse(coupon, 'Coupon created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupon = await CouponService.updateCoupon(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(coupon, 'Coupon updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await CouponService.deleteCoupon(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Coupon deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async applyCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await CouponService.applyCoupon(req.body);
            res.status(200).json(successResponse(result, 'Coupon applied successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
