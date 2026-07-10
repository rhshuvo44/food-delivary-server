import { paginatedResponse, successResponse } from '../../utils/apiResponse';
import { AuthenticatedValidatedRequest } from '../auth/auth.middlewares';
import { NextFunction, Response } from 'express';
import { CategoryService } from './category.service';
import { categoryValidators } from './category.validators';

type CreateCategoryRequest = AuthenticatedValidatedRequest<
  typeof categoryValidators.createCategorySchema
>;
type UpdateCategoryRequest = AuthenticatedValidatedRequest<
  typeof categoryValidators.updateCategorySchema
>;
type DeleteCategoryRequest = AuthenticatedValidatedRequest<
  typeof categoryValidators.deleteCategorySchema
>;
type GetCategoriesRequest = import('../../middlewares/requestValidator').ValidatedRequest<
  typeof categoryValidators.getCategoriesSchema
>;
export class CategoryController {
  static createCategory = async (
    req: CreateCategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const category = await CategoryService.createCategory(req.user!, req.body);
      res.status(201).json(successResponse(category, 'Category created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static updateCategory = async (
    req: UpdateCategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const category = await CategoryService.updateCategory(req.user!, req.params.id, req.body);
      res.status(200).json(successResponse(category, 'Category updated successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static deleteCategory = async (
    req: DeleteCategoryRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await CategoryService.deleteCategory(req.user!, req.params.id);
      res.status(200).json(successResponse(null, 'Category deleted successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getCategories = async (
    req: GetCategoriesRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { page, limit, search, name, restaurantId } = req.query;

      const result = await CategoryService.getCategories({
        page,
        limit,
        search,
        name,
        restaurantId,
      });

      res
        .status(200)
        .json(
          paginatedResponse(result.categories, result.meta, 'Categories fetched successfully', 200)
        );
    } catch (error) {
      next(error);
    }
  };
}
