import { Router } from 'express';
import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../auth/auth.middlewares';
import { authorize } from '../auth/rbac.middleware';
import { CategoryController } from './category.controller';
import { categoryPermissions } from './category.rbac';
import { categoryValidators } from './category.validators';
const router = Router();

router.post(
  '/',
  authenticate,
  authorize(categoryPermissions.createCategory),
  validateRequest(categoryValidators.createCategorySchema),
  asyncHandler(CategoryController.createCategory)
);

router.put(
  '/:id',
  authenticate,
  authorize(categoryPermissions.updateCategory),
  validateRequest(categoryValidators.updateCategorySchema),
  asyncHandler(CategoryController.updateCategory)
);

router.delete(
  '/:id',
  authenticate,
  authorize(categoryPermissions.deleteCategory),
  validateRequest(categoryValidators.deleteCategorySchema),
  asyncHandler(CategoryController.deleteCategory)
);

router.get(
  '/',
  validateRequest(categoryValidators.getCategoriesSchema),
  asyncHandler(CategoryController.getCategories)
);

export const categoryRoutes = router;
