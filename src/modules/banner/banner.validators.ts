import { z } from 'zod';

export const bannerValidators = {
  createBannerSchema: z.object({
    body: z
      .object({
        restaurantId: z.string().uuid().optional(),
        title: z.string().min(2).max(120),
        subtitle: z.string().max(255).optional(),
        imageBase64: z.string().min(1).optional(),
        imagePath: z.string().min(1).optional(),
        actionUrl: z.string().url().optional(),
        priority: z.coerce.number().int().nonnegative().optional(),
        isActive: z.boolean().optional(),
      })
      .refine((data) => Boolean(data.imageBase64 || data.imagePath), {
        message: 'imageBase64 or imagePath is required',
      }),
  }),

  updateBannerSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      restaurantId: z.string().uuid().nullable().optional(),
      title: z.string().min(2).max(120).optional(),
      subtitle: z.string().max(255).nullable().optional(),
      imageBase64: z.string().min(1).optional(),
      imagePath: z.string().min(1).optional(),
      actionUrl: z.string().url().nullable().optional(),
      priority: z.coerce.number().int().nonnegative().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  deleteBannerSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),
};
