import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from './auth.middlewares';
import { authValidators } from './auth.validators';
import { authorize } from './rbac.middleware';
import { validateRequest } from '../../middlewares/requestValidator';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post(
  '/register',
  validateRequest(authValidators.registerSchema),
  asyncHandler(AuthController.register)
);
router.post(
  '/login',
  validateRequest(authValidators.loginSchema),
  asyncHandler(AuthController.login)
);
router.post('/logout', authenticate, asyncHandler(AuthController.logout));
router.post('/refresh', asyncHandler(AuthController.refreshToken));
router.post(
  '/forgot-password',
  validateRequest(authValidators.forgotPasswordSchema),
  asyncHandler(AuthController.forgotPassword)
);
router.post(
  '/reset-password',
  validateRequest(authValidators.resetPasswordSchema),
  asyncHandler(AuthController.resetPassword)
);

// Example RBAC protected route
router.get(
  '/me',
  authenticate,
  authorize(['ADMIN', 'RESTAURANT', 'CUSTOMER']),
  asyncHandler(AuthController.getProfile)
);

export const AuthRoutes = router;
