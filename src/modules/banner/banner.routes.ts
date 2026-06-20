
import { Router } from 'express';
import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { BannerController } from './banner.controller';
import { bannerPermissions } from './banner.rbac';
import { bannerValidators } from './banner.validators';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(bannerPermissions.createBanner),
    validateRequest(bannerValidators.createBannerSchema),
    asyncHandler(BannerController.createBanner),
);

router.put(
    '/:id',
    authenticate,
    authorize(bannerPermissions.updateBanner),
    validateRequest(bannerValidators.updateBannerSchema),
    asyncHandler(BannerController.updateBanner),
);

router.delete(
    '/:id',
    authenticate,
    authorize(bannerPermissions.deleteBanner),
    validateRequest(bannerValidators.deleteBannerSchema),
    asyncHandler(BannerController.deleteBanner),
);

export const bannerRoutes = router
