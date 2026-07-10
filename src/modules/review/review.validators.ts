import { z } from 'zod';

export const reviewValidators = {
  createReviewSchema: z.object({
    body: z.object({
      orderId: z.string().uuid(),
      foodId: z.string().uuid().optional(),
      rating: z.number().int().min(1).max(5),
      title: z.string().min(2).max(120).optional(),
      comment: z.string().min(2).max(1000).optional(),
    }),
  }),

  updateReviewSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({
      rating: z.number().int().min(1).max(5).optional(),
      title: z.string().min(2).max(120).nullable().optional(),
      comment: z.string().min(2).max(1000).nullable().optional(),
    }),
  }),

  deleteReviewSchema: z.object({
    params: z.object({
      id: z.string().uuid(),
    }),
  }),
};
