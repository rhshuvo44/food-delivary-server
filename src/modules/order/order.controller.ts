import { paginatedResponse, successResponse } from '../../utils/apiResponse';

import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { OrderService } from './order.service';

export class OrderController {
    static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await OrderService.createOrder(req.user!, req.body);
            res.status(201).json(successResponse(order, 'Order created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await OrderService.updateOrder(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(order, 'Order updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await OrderService.deleteOrder(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Order deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = req.query.page ? Number(req.query.page) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
            const restaurantId = typeof req.query.restaurantId === 'string' ? req.query.restaurantId : undefined;
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;

            const result = await OrderService.getOrders(req.user!, {
                page,
                limit,
                userId,
                restaurantId,
                status,
            });

            res.status(200).json(paginatedResponse(result.orders, result.meta, 'Orders fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await OrderService.getOrderById(req.user!, req.params.id);
            res.status(200).json(successResponse(order, 'Order fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await OrderService.updateOrderStatus(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(order, 'Order status updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getOrderHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const history = await OrderService.getOrderHistory(req.user!, req.params.id);
            res.status(200).json(successResponse(history, 'Order history fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
