import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Request, Response } from 'express';
import { CategoryService } from './category.service';
export class CategoryController {
    static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await CategoryService.createCategory(req.user!, req.body);
            res.status(201).json(successResponse(category, 'Category created successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const category = await CategoryService.updateCategory(req.user!, req.params.id, req.body);
            res.status(200).json(successResponse(category, 'Category updated successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            await CategoryService.deleteCategory(req.user!, req.params.id);
            res.status(200).json(successResponse(null, 'Category deleted successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = req.query.page ? Number(req.query.page) : undefined;
            const limit = req.query.limit ? Number(req.query.limit) : undefined;
            const search = typeof req.query.search === 'string' ? req.query.search : undefined;
            const name = typeof req.query.name === 'string' ? req.query.name : undefined;
            const restaurantId = typeof req.query.restaurantId === 'string' ? req.query.restaurantId : undefined;

            const result = await CategoryService.getCategories({
                page,
                limit,
                search,
                name,
                restaurantId,
            });

            res.status(200).json(paginatedResponse(result.categories, result.meta, 'Categories fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
