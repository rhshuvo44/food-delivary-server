import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Request, Response } from 'express';
import { FoodService } from './food.service';

export class FoodController {
    static async createFood(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const food = await FoodService.createFood(req.user!, req.body);
            res.status(201).json(successResponse(food, 'Food created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateFood(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const food = await FoodService.updateFood(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(food, 'Food updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteFood(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await FoodService.deleteFood(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Food deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = req.query.page ? Number(req.query.page) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const search = typeof req.query.search === 'string' ? req.query.search : undefined;
            const name = typeof req.query.name === 'string' ? req.query.name : undefined;
            const restaurantId = typeof req.query.restaurantId === 'string' ? req.query.restaurantId : undefined;
            const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
            const isAvailable =
                req.query.isAvailable === 'true' ? true : req.query.isAvailable === 'false' ? false : undefined;
            const isFeatured =
                req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined;
            const sortBy = (
                ['price', 'name', 'createdAt', 'preparationTime'].includes(String(req.query.sortBy))
                    ? req.query.sortBy
                    : 'createdAt'
            ) as 'price' | 'name' | 'createdAt' | 'preparationTime';
            const sortOrder = (req.query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
            const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
            const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

            const result = await FoodService.getFoods({
                page,
                limit,
                search,
                name,
                restaurantId,
                categoryId,
                isAvailable,
                isFeatured,
                sortBy,
                sortOrder,
                minPrice,
                maxPrice,
            });

            res.status(200).json(paginatedResponse(result.foods, result.meta, 'Foods fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
