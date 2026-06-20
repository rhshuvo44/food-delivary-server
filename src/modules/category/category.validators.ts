import { z } from 'zod';

export const categoryValidators = {
    createCategorySchema: z.object({
        body: z.object({
            restaurantId: z.string().uuid(),
            name: z.string().min(2),
            description: z.string().optional(),
            sortOrder: z.number().int().nonnegative().optional(),
        }),
    }),

    updateCategorySchema: z.object({
        body: z.object({
            name: z.string().min(2).optional(),
            description: z.string().optional(),
            sortOrder: z.number().int().nonnegative().optional(),
        }),
        params: z.object({
            id: z.string().uuid(),
        }),
    }),

    getCategoriesSchema: z.object({
        query: z.object({
            page: z.coerce.number().int().min(1).optional(),
            limit: z.coerce.number().int().min(1).optional(),
            search: z.string().optional(),
            name: z.string().optional(),
            restaurantId: z.string().uuid().optional(),
        }),
    }),

    deleteCategorySchema: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
    }),

    categoryIdParamsSchema: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
    }),
};
