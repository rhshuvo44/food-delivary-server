import { Router } from 'express';
import { handleRegister, handleLogin, handleRefresh, handleLogout } from './auth.controller';
import { validate, protect, restrictTo } from './auth.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

// Public Routes
router.post('/register', validate(registerSchema), handleRegister);
router.post('/login', validate(loginSchema), handleLogin);
router.post('/refresh', handleRefresh);
router.post('/logout', handleLogout);

// Example of Protected & Role-Based Routes
router.get('/admin-dashboard', protect, restrictTo('SUPER_ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Welcome to Admin Panel' });
});

router.get('/restaurant/orders', protect, restrictTo('RESTAURANT_OWNER', 'SUPER_ADMIN'), (req, res) => {
  res.status(200).json({ message: 'Active Orders for your Restaurant' });
});

export default router;