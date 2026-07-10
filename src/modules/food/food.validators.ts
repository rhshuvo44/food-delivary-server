import { z } from 'zod';

export const foodValidators = {
  createFoodSchema: z.object({
    body: z.object({
      restaurantId: z.string().uuid(),
      categoryId: z.string().uuid().optional(),
      name: z.string().min(2),
      description: z.string().optional(),
      price: z.coerce.number().positive(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      calories: z.coerce.number().int().nonnegative().optional(),
      preparationTime: z.coerce.number().int().positive().optional(),
      imageUrl: z.string().url().optional(),
    }),
  }),

  updateFoodSchema: z.object({
    body: z.object({
      categoryId: z.string().uuid().optional(),
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      price: z.coerce.number().positive().optional(),
      isAvailable: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      calories: z.coerce.number().int().nonnegative().optional(),
      preparationTime: z.coerce.number().int().positive().optional(),
      imageUrl: z.string().url().optional(),
    }),
    params: z.object({
      id: z.string().uuid(),
    }),
  }),

  getFoodsSchema: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).optional(),
      search: z.string().optional(),
      name: z.string().optional(),
      restaurantId: z.string().uuid().optional(),
      categoryId: z.string().uuid().optional(),
      isAvailable: z.preprocess((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true'
            ? true
            : value.toLowerCase() === 'false'
            ? false
            : undefined;
        }
        if (typeof value === 'boolean') {
          return value;
        }
        return undefined;
      }, z.boolean().optional()),
      isFeatured: z.preprocess((value) => {
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true'
            ? true
            : value.toLowerCase() === 'false'
            ? false
            : undefined;
        }
        if (typeof value === 'boolean') {
          return value;
        }
        return undefined;
      }, z.boolean().optional()),
      sortBy: z.enum(['price', 'name', 'createdAt', 'preparationTime']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
    }),
  }),

  deleteFoodSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),

  foodIdParamsSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),
};
