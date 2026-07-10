import { config } from '../../config/environment';
import prisma from '../../config/prisma';
import { UserRole } from '../../generated/prisma/enums';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/errors';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  static getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  static generateAccessToken(user: { id: string; role: string }) {
    return jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.ACCESS_TOKEN_EXPIRE,
    });
  }

  static generateRefreshToken(user: { id: string; role: string }) {
    return jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRE,
    });
  }

  static async register(payload: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role?: UserRole;
  }) {
    const email = payload.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email,
        password: hashedPassword,
        role: payload.role ?? 'CUSTOMER',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  static async login(payload: { email: string; password: string }) {
    const email = payload.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = this.generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = this.generateRefreshToken({ id: user.id, role: user.role });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static logout(_refreshToken?: string): Promise<void> {
    return Promise.resolve();
  }

  static async refreshToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    let payload: jwt.JwtPayload;
    try {
      const verifiedToken = jwt.verify(refreshToken, config.JWT_SECRET);
      if (typeof verifiedToken === 'string' || typeof verifiedToken.sub !== 'string') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      payload = verifiedToken;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const accessToken = this.generateAccessToken({ id: user.id, role: user.role });
    const newRefreshToken = this.generateRefreshToken({ id: user.id, role: user.role });

    return { accessToken, refreshToken: newRefreshToken };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return;
    }

    const resetToken = jwt.sign({ sub: user.id }, config.JWT_SECRET, {
      expiresIn: '1h',
    });

    return resetToken;
  }

  static async resetPassword(token: string, password: string) {
    let payload: jwt.JwtPayload;
    try {
      const verifiedToken = jwt.verify(token, config.JWT_SECRET);
      if (typeof verifiedToken === 'string' || typeof verifiedToken.sub !== 'string') {
        throw new UnauthorizedError('Invalid or expired reset token');
      }
      payload = verifiedToken;
    } catch {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
  }
}
