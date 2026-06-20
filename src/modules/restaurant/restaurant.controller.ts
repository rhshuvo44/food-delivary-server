import { NextFunction, Request, Response } from 'express';
import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { RestaurantService } from './restaurant.service';

export class RestaurantController {
    static async createRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurant = await RestaurantService.createRestaurant(req.user!, req.body);
            res.status(201).json(successResponse(restaurant, 'Restaurant created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurant = await RestaurantService.updateRestaurant(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(restaurant, 'Restaurant updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = req.query.page ? Number(req.query.page) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const name = typeof req.query.name === 'string' ? req.query.name : undefined;
            const cuisineType = typeof req.query.cuisineType === 'string' ? req.query.cuisineType : undefined;
            const isOpen = req.query.isOpen === 'true' ? true : req.query.isOpen === 'false' ? false : undefined;
            const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
            const ownerId = typeof req.query.ownerId === 'string' ? req.query.ownerId : undefined;

            const result = await RestaurantService.getRestaurants({
                page,
                limit,
                name,
                cuisineType,
                isOpen,
                isActive,
                ownerId,
            });

            res.status(200).json(paginatedResponse(result.restaurants, result.meta, 'Restaurants fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async approveRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurant = await RestaurantService.approveRestaurant(req.params.id);
            res.status(200).json(successResponse(restaurant, 'Restaurant approved successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async suspendRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurant = await RestaurantService.suspendRestaurant(req.params.id);
            res.status(200).json(successResponse(restaurant, 'Restaurant suspended successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
