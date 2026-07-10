import { NextFunction, Response } from 'express';
import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { RestaurantService } from './restaurant.service';
import { restaurantValidators } from './restaurant.validators';

type CreateRestaurantRequest = AuthenticatedValidatedRequest<
  typeof restaurantValidators.createRestaurantSchema
>;
type UpdateRestaurantRequest = AuthenticatedValidatedRequest<
  typeof restaurantValidators.updateRestaurantSchema
>;
type RestaurantIdRequest = AuthenticatedValidatedRequest<
  typeof restaurantValidators.restaurantIdParamsSchema
>;
type GetRestaurantsRequest = import('../../middlewares/requestValidator').ValidatedRequest<
  typeof restaurantValidators.getRestaurantsSchema
>;

export class RestaurantController {
  static createRestaurant = async (
    req: CreateRestaurantRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const restaurant = await RestaurantService.createRestaurant(req.user!, req.body);
      res.status(201).json(successResponse(restaurant, 'Restaurant created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateRestaurant = async (
    req: UpdateRestaurantRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const restaurant = await RestaurantService.updateRestaurant(
        req.user!,
        req.params.id,
        req.body
      );
      res.status(200).json(successResponse(restaurant, 'Restaurant updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getRestaurants = async (
    req: GetRestaurantsRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit, name, cuisineType, isOpen, isActive, ownerId } = req.query;

      const result = await RestaurantService.getRestaurants({
        page,
        limit,
        name,
        cuisineType,
        isOpen,
        isActive,
        ownerId,
      });

      res
        .status(200)
        .json(
          paginatedResponse(
            result.restaurants,
            result.meta,
            'Restaurants fetched successfully',
            200
          )
        );
    } catch (error) {
      next(error);
    }
  };

  static approveRestaurant = async (
    req: RestaurantIdRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const restaurant = await RestaurantService.approveRestaurant(req.params.id);
      res.status(200).json(successResponse(restaurant, 'Restaurant approved successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static suspendRestaurant = async (
    req: RestaurantIdRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const restaurant = await RestaurantService.suspendRestaurant(req.params.id);
      res.status(200).json(successResponse(restaurant, 'Restaurant suspended successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
