import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './auth.middlewares';
import { ForbiddenError } from '../../utils/errors';

export const authorize =
  (roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      next(new ForbiddenError('Access denied'));
      return;
    }
    next();
  };
