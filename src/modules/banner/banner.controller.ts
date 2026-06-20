
import { NextFunction, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { BannerService } from './banner.service';

export class BannerController {
    static async createBanner(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const banner = await BannerService.createBanner(req.user!, req.body);
            res.status(201).json(successResponse(banner, 'Banner created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateBanner(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const banner = await BannerService.updateBanner(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(banner, 'Banner updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteBanner(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await BannerService.deleteBanner(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Banner deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
