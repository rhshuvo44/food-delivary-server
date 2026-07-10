import { z } from 'zod';

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const authValidators = {
  registerSchema: z.object({
    body: z.object({
      firstName: z.string().min(2),
      lastName: z.string().optional(),
      email: z.string().email(),
      password: z
        .string()
        .regex(
          passwordPattern,
          'Password must be at least 8 characters and contain letters and numbers'
        ),
      role: z.enum(['ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER', 'DELIVERY']).optional(),
    }),
  }),

  loginSchema: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  }),

  forgotPasswordSchema: z.object({
    body: z.object({
      email: z.string().email(),
    }),
  }),

  resetPasswordSchema: z.object({
    body: z.object({
      token: z.string().min(1),
      password: z
        .string()
        .regex(
          passwordPattern,
          'Password must be at least 8 characters and contain letters and numbers'
        ),
    }),
  }),
};
