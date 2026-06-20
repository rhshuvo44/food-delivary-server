
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError } from '../../utils/errors';
import { config } from '../../config/environment';
import prisma from '../../config/prisma';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email?: string;
    };
}

export const authenticate = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

    if (!token) {
        return next(new UnauthorizedError('Authentication required'));
    }

    try {
        const payload = jwt.verify(token, config.JWT_SECRET) as { sub: string; role: string; email?: string };
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });

        if (!user) {
            return next(new UnauthorizedError('User not found'));
        }

        req.user = { id: user.id, role: user.role, email: user.email };
        next();
    } catch {
        next(new UnauthorizedError('Invalid or expired access token'));
    }
};

export const authorize = (roles: string[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
        next(new ForbiddenError('Access denied'));
        return;
    }

    next();
};
