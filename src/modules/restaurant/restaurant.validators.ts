import { z } from 'zod';

export const restaurantValidators = {
  createRestaurantSchema: z.object({
    body: z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
      coverUrl: z.string().url().optional(),
      cuisineType: z.string().optional(),
      addressId: z.string().uuid().optional(),
    }),
  }),

  updateRestaurantSchema: z.object({
    body: z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      logoUrl: z.string().url().optional(),
      coverUrl: z.string().url().optional(),
      cuisineType: z.string().optional(),
      addressId: z.string().uuid().optional(),
      isOpen: z.boolean().optional(),
    }),
    params: z.object({
      id: z.string().uuid(),
    }),
  }),

  getRestaurantsSchema: z.object({
    query: z.object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).optional(),
      name: z.string().optional(),
      cuisineType: z.string().optional(),
      isOpen: z.preprocess((value) => {
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
      isActive: z.preprocess((value) => {
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
      ownerId: z.string().uuid().optional(),
    }),
  }),

  restaurantIdParamsSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),
};
