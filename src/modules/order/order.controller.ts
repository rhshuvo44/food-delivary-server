import { paginatedResponse, successResponse } from '../../utils/apiResponse';

import { NextFunction, Response } from 'express';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { OrderService } from './order.service';
import { orderValidators } from './order.validators';

type CreateOrderRequest = AuthenticatedValidatedRequest<typeof orderValidators.createOrderSchema>;
type UpdateOrderRequest = AuthenticatedValidatedRequest<typeof orderValidators.updateOrderSchema>;
type UpdateOrderStatusRequest = AuthenticatedValidatedRequest<
  typeof orderValidators.updateOrderStatusSchema
>;
type OrderIdRequest = AuthenticatedValidatedRequest<typeof orderValidators.orderIdParamsSchema>;
type GetOrdersRequest = AuthenticatedValidatedRequest<typeof orderValidators.getOrdersSchema>;

export class OrderController {
  static createOrder = async (
    req: CreateOrderRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const order = await OrderService.createOrder(req.user!, req.body);
      res.status(201).json(successResponse(order, 'Order created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateOrder = async (
    req: UpdateOrderRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const order = await OrderService.updateOrder(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(order, 'Order updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteOrder = async (
    req: OrderIdRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await OrderService.deleteOrder(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Order deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getOrders = async (
    req: GetOrdersRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit, userId, restaurantId, status } = req.query;

      const result = await OrderService.getOrders(req.user!, {
        page,
        limit,
        userId,
        restaurantId,
        status,
      });

      res
        .status(200)
        .json(paginatedResponse(result.orders, result.meta, 'Orders fetched successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getOrder = async (
    req: OrderIdRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const order = await OrderService.getOrderById(req.user!, req.params.id);
      res.status(200).json(successResponse(order, 'Order fetched successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static updateOrderStatus = async (
    req: UpdateOrderStatusRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const order = await OrderService.updateOrderStatus(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(order, 'Order status updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getOrderHistory = async (
    req: OrderIdRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const history = await OrderService.getOrderHistory(req.user!, req.params.id);
      res.status(200).json(successResponse(history, 'Order history fetched successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
