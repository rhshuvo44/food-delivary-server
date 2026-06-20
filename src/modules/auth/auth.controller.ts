
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from './auth.middlewares';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/apiResponse';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user = await AuthService.register(req.body);
            res.status(201).json(successResponse(user, 'User registered successfully', 201));
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, accessToken, refreshToken } = await AuthService.login(req.body);
            res
                .cookie('refreshToken', refreshToken, AuthService.getRefreshCookieOptions())
                .status(200)
                .json(successResponse({ user, accessToken }, 'Login successful', 200));
        } catch (error) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies?.refreshToken;
            await AuthService.logout(refreshToken);
            res
                .clearCookie('refreshToken', AuthService.getRefreshCookieOptions())
                .status(200)
                .json(successResponse(null, 'Logout successful', 200));
        } catch (error) {
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshToken = req.cookies?.refreshToken;
            const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(refreshToken);
            res
                .cookie('refreshToken', newRefreshToken, AuthService.getRefreshCookieOptions())
                .status(200)
                .json(successResponse({ accessToken }, 'Token refreshed', 200));
        } catch (error) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await AuthService.forgotPassword(req.body.email);
            res.status(200).json(successResponse(null, 'Reset password email sent', 200));
        } catch (error) {
            next(error);
        }
    }

    static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await AuthService.resetPassword(req.body.token, req.body.password);
            res.status(200).json(successResponse(null, 'Password reset successfully', 200));
        } catch (error) {
            next(error);
        }
    }

    static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new Error('Authenticated user missing');
            }
            res.status(200).json(successResponse(req.user, 'Profile fetched successfully', 200));
        } catch (error) {
            next(error);
        }
    }
}
