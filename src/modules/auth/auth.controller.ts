import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // true in production
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const handleRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) { next(err); }
};

export const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    
    // Set Refresh Token in HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);
    
    res.status(200).json({ status: 'success', accessToken, user });
  } catch (err) { next(err); }
};

export const handleRefresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new Error('Refresh token missing');

    const { accessToken } = await authService.refresh(token);
    res.status(200).json({ status: 'success', accessToken });
  } catch (err) { next(err); }
};

export const handleLogout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};