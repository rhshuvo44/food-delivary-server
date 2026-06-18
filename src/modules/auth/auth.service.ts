import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken, verifyRefreshToken } from './crypto.util';
import { AppError } from './errors';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  async register(body: any) {
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) throw new AppError(409, 'Email already registered');

    const hashedPassword = await hashPassword(body.password);
    
    return prisma.user.create({
      data: { ...body, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true }
    });
  }

  async login(body: any) {
    const user = await prisma.user.findUnique({ where: { email: body.email, isDeleted: false } });
    if (!user || !(await comparePassword(body.password, user.password))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    return { user: { id: user.id, name: user.name, role: user.role }, accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId, isDeleted: false } });
      if (!user) throw new AppError(401, 'User no longer exists');

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      return { accessToken };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent return to prevent User Enumeration Attack

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save token securely (You can add these optional fields to User model if needed)
    // For schema integration: await prisma.user.update(...)
    
    console.log(`[SECURITY] Reset Token for ${email}: ${resetToken}`); 
    // real app: send email via Nodemailer/Sendgrid
  }
}