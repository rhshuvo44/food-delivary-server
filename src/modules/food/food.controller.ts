import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { FoodService } from './food.service';
import { foodValidators } from './food.validators';

type CreateFoodRequest = AuthenticatedValidatedRequest<typeof foodValidators.createFoodSchema>;
type UpdateFoodRequest = AuthenticatedValidatedRequest<typeof foodValidators.updateFoodSchema>;
type DeleteFoodRequest = AuthenticatedValidatedRequest<typeof foodValidators.deleteFoodSchema>;
type GetFoodsRequest = import('../../middlewares/requestValidator').ValidatedRequest<
  typeof foodValidators.getFoodsSchema
>;

export class FoodController {
  static createFood = async (
    req: CreateFoodRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const food = await FoodService.createFood(req.user!, req.body);
      res.status(201).json(successResponse(food, 'Food created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateFood = async (
    req: UpdateFoodRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const food = await FoodService.updateFood(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(food, 'Food updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteFood = async (
    req: DeleteFoodRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await FoodService.deleteFood(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Food deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getFoods = async (
    req: GetFoodsRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        page,
        limit,
        search,
        name,
        restaurantId,
        categoryId,
        isAvailable,
        isFeatured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        minPrice,
        maxPrice,
      } = req.query;

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

      res
        .status(200)
        .json(paginatedResponse(result.foods, result.meta, 'Foods fetched successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
