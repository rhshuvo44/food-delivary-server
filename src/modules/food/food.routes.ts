import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { Router } from 'express';
import { FoodController } from './food.controller';
import { foodPermissions } from './food.rbac';
import { foodValidators } from './food.validators';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(foodPermissions.createFood),
    validateRequest(foodValidators.createFoodSchema),
    asyncHandler(FoodController.createFood),
);

router.put(
    '/:id',
    authenticate,
    authorize(foodPermissions.updateFood),
    validateRequest(foodValidators.updateFoodSchema),
    asyncHandler(FoodController.updateFood),
);

router.delete(
    '/:id',
    authenticate,
    authorize(foodPermissions.deleteFood),
    validateRequest(foodValidators.deleteFoodSchema),
    asyncHandler(FoodController.deleteFood),
);

router.get('/', validateRequest(foodValidators.getFoodsSchema), asyncHandler(FoodController.getFoods));

export const foodRoutes = router
