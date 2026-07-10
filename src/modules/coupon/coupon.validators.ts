import { z } from 'zod';

const couponTypeSchema = z.enum(['PERCENTAGE', 'FIXED']);

export const couponValidators = {
  createCouponSchema: z.object({
    body: z.object({
      code: z.string().trim().min(3).max(32),
      description: z.string().optional(),
      type: couponTypeSchema.optional(),
      discountValue: z.number().positive(),
      minOrderValue: z.number().nonnegative().optional(),
      maxDiscount: z.number().positive().optional(),
      validFrom: z.coerce.date(),
      validUntil: z.coerce.date(),
      usageLimit: z.number().int().positive().optional(),
      restaurantId: z.string().uuid().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  updateCouponSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      code: z.string().trim().min(3).max(32).optional(),
      description: z.string().optional(),
      type: couponTypeSchema.optional(),
      discountValue: z.number().positive().optional(),
      minOrderValue: z.number().nonnegative().optional(),
      maxDiscount: z.number().positive().nullable().optional(),
      validFrom: z.coerce.date().optional(),
      validUntil: z.coerce.date().optional(),
      usageLimit: z.number().int().positive().nullable().optional(),
      restaurantId: z.string().uuid().nullable().optional(),
      isActive: z.boolean().optional(),
    }),
  }),

  deleteCouponSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),

  applyCouponSchema: z.object({
    body: z.object({
      code: z.string().trim().min(3).max(32),
      restaurantId: z.string().uuid().optional(),
      orderAmount: z.number().positive(),
    }),
  }),
};
