import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './crypto.util';
import { AppError } from './errors';
import { AnyZodObject } from 'zod';

// Request Validation Middleware
export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    return next();
  } catch (error: any) {
    return res.status(400).json({ status: 'fail', errors: error.errors });
  }
};

// Route Protection Middleware
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError(401, 'You are not logged in. Please login to get access.'));

    const decoded = verifyAccessToken(token);
    req.user = decoded; // Object structure: { userId: string, role: string }
    next();
  } catch (error) {
    return next(new AppError(401, 'Invalid token or token expired'));
  }
};

// Role Authorization Middleware
export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};