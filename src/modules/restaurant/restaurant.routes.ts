import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { Router } from 'express';
import { RestaurantController } from './restaurant.controller';
import { restaurantPermissions } from './restaurant.rbac';
import { restaurantValidators } from './restaurant.validators';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(restaurantPermissions.createRestaurant),
    validateRequest(restaurantValidators.createRestaurantSchema),
    asyncHandler(RestaurantController.createRestaurant),
);

router.put(
    '/:id',
    authenticate,
    authorize(restaurantPermissions.updateRestaurant),
    validateRequest(restaurantValidators.updateRestaurantSchema),
    asyncHandler(RestaurantController.updateRestaurant),
);

router.get('/', validateRequest(restaurantValidators.getRestaurantsSchema), asyncHandler(RestaurantController.getRestaurants));

router.patch(
    '/:id/approve',
    authenticate,
    authorize(restaurantPermissions.approveRestaurant),
    validateRequest(restaurantValidators.restaurantIdParamsSchema),
    asyncHandler(RestaurantController.approveRestaurant),
);

router.patch(
    '/:id/suspend',
    authenticate,
    authorize(restaurantPermissions.suspendRestaurant),
    validateRequest(restaurantValidators.restaurantIdParamsSchema),
    asyncHandler(RestaurantController.suspendRestaurant),
);

export default router;
