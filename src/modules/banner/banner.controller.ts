import { NextFunction, Response } from 'express';
import { successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { BannerService } from './banner.service';
import { bannerValidators } from './banner.validators';

type CreateBannerRequest = AuthenticatedValidatedRequest<
  typeof bannerValidators.createBannerSchema
>;
type UpdateBannerRequest = AuthenticatedValidatedRequest<
  typeof bannerValidators.updateBannerSchema
>;
type DeleteBannerRequest = AuthenticatedValidatedRequest<
  typeof bannerValidators.deleteBannerSchema
>;

export class BannerController {
  static createBanner = async (
    req: CreateBannerRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const banner = await BannerService.createBanner(req.user!, req.body);
      res.status(201).json(successResponse(banner, 'Banner created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateBanner = async (
    req: UpdateBannerRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const banner = await BannerService.updateBanner(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(banner, 'Banner updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteBanner = async (
    req: DeleteBannerRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await BannerService.deleteBanner(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Banner deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
