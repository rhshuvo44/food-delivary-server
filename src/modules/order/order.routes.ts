import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { Router } from 'express';
import { OrderController } from './order.controller';
import { orderPermissions } from './order.rbac';
import { orderValidators } from './order.validators';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(orderPermissions.createOrder),
    validateRequest(orderValidators.createOrderSchema),
    asyncHandler(OrderController.createOrder),
);

router.get(
    '/',
    authenticate,
    authorize(orderPermissions.getOrders),
    validateRequest(orderValidators.getOrdersSchema),
    asyncHandler(OrderController.getOrders),
);

router.get(
    '/:id',
    authenticate,
    authorize(orderPermissions.getOrder),
    validateRequest(orderValidators.orderIdParamsSchema),
    asyncHandler(OrderController.getOrder),
);

router.get(
    '/:id/history',
    authenticate,
    authorize(orderPermissions.getOrderHistory),
    validateRequest(orderValidators.orderIdParamsSchema),
    asyncHandler(OrderController.getOrderHistory),
);

router.put(
    '/:id',
    authenticate,
    authorize(orderPermissions.updateOrder),
    validateRequest(orderValidators.updateOrderSchema),
    asyncHandler(OrderController.updateOrder),
);

router.patch(
    '/:id/status',
    authenticate,
    authorize(orderPermissions.updateOrderStatus),
    validateRequest(orderValidators.updateOrderStatusSchema),
    asyncHandler(OrderController.updateOrderStatus),
);

router.delete(
    '/:id',
    authenticate,
    authorize(orderPermissions.deleteOrder),
    validateRequest(orderValidators.orderIdParamsSchema),
    asyncHandler(OrderController.deleteOrder),
);

export const orderRoutes = router
