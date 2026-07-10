import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from './auth.middlewares';
import { ValidatedRequest } from '../../middlewares/requestValidator';
import { AuthService } from './auth.service';
import { successResponse } from '../../utils/apiResponse';
import { authValidators } from './auth.validators';

type RegisterRequest = ValidatedRequest<typeof authValidators.registerSchema>;
type LoginRequest = ValidatedRequest<typeof authValidators.loginSchema>;
type ForgotPasswordRequest = ValidatedRequest<typeof authValidators.forgotPasswordSchema>;
type ResetPasswordRequest = ValidatedRequest<typeof authValidators.resetPasswordSchema>;

const getRefreshToken = (req: Request): string | undefined => {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== 'object' || cookies === null || !('refreshToken' in cookies)) {
    return undefined;
  }

  const refreshToken = (cookies as Record<string, unknown>).refreshToken;
  return typeof refreshToken === 'string' ? refreshToken : undefined;
};

export class AuthController {
  static register = async (req: RegisterRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json(successResponse(user, 'User registered successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  static login = async (req: LoginRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);
      res
        .cookie('refreshToken', refreshToken, AuthService.getRefreshCookieOptions())
        .status(200)
        .json(successResponse({ user, accessToken }, 'Login successful', 200));
    } catch (error) {
      next(error);
    }
  };

  static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = getRefreshToken(req);
      await AuthService.logout(refreshToken);
      res
        .clearCookie('refreshToken', AuthService.getRefreshCookieOptions())
        .status(200)
        .json(successResponse(null, 'Logout successful', 200));
    } catch (error) {
      next(error);
    }
  };

  static refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = getRefreshToken(req);
      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(
        refreshToken
      );
      res
        .cookie('refreshToken', newRefreshToken, AuthService.getRefreshCookieOptions())
        .status(200)
        .json(successResponse({ accessToken }, 'Token refreshed', 200));
    } catch (error) {
      next(error);
    }
  };

  static forgotPassword = async (
    req: ForgotPasswordRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await AuthService.forgotPassword(req.body.email);
      res.status(200).json(successResponse(null, 'Reset password email sent', 200));
    } catch (error) {
      next(error);
    }
  };

  static resetPassword = async (
    req: ResetPasswordRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      res.status(200).json(successResponse(null, 'Password reset successfully', 200));
    } catch (error) {
      next(error);
    }
  };

  static getProfile = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw new Error('Authenticated user missing');
      }
      res.status(200).json(successResponse(req.user, 'Profile fetched successfully', 200));
    } catch (error) {
      next(error);
    }
  };
}
