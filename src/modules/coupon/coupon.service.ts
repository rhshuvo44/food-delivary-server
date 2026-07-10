import prisma from '../../config/prisma';
import { CouponType } from '../../generated/prisma';
// import { CouponType } from '../../generated/prisma/enums';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';

type AuthUser = { id: string; role: string };

export interface CreateCouponPayload {
  code: string;
  description?: string;
  type?: CouponType;
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  restaurantId?: string;
  isActive?: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  description?: string;
  type?: CouponType;
  discountValue?: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number | null;
  restaurantId?: string | null;
  isActive?: boolean;
}

export interface ApplyCouponPayload {
  code: string;
  restaurantId?: string;
  orderAmount: number;
}

export class CouponService {
  static async createCoupon(user: AuthUser, payload: CreateCouponPayload) {
    this.assertValidDateRange(payload.validFrom, payload.validUntil);
    this.assertValidDiscount(payload.type ?? 'PERCENTAGE', payload.discountValue);

    if (payload.restaurantId) {
      await this.assertRestaurantAccess(user, payload.restaurantId);
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create global coupons');
    }

    const code = this.normalizeCode(payload.code);
    const existingCoupon = await prisma.coupon.findUnique({ where: { code } });

    if (existingCoupon) {
      throw new ConflictError('Coupon code already exists');
    }

    return prisma.coupon.create({
      data: {
        code,
        description: payload.description,
        type: payload.type ?? 'PERCENTAGE',
        discountValue: payload.discountValue,
        minOrderValue: payload.minOrderValue ?? 0,
        maxDiscount: payload.maxDiscount,
        validFrom: payload.validFrom,
        validUntil: payload.validUntil,
        usageLimit: payload.usageLimit,
        restaurantId: payload.restaurantId,
        isActive: payload.isActive ?? true,
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async updateCoupon(user: AuthUser, couponId: string, payload: UpdateCouponPayload) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { restaurant: true },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    this.assertCouponAccess(user, coupon.restaurant?.ownerId, coupon.restaurantId);

    const nextType = payload.type ?? coupon.type;
    const nextDiscountValue = payload.discountValue ?? Number(coupon.discountValue);
    this.assertValidDiscount(nextType, nextDiscountValue);

    const nextValidFrom = payload.validFrom ?? coupon.validFrom;
    const nextValidUntil = payload.validUntil ?? coupon.validUntil;
    this.assertValidDateRange(nextValidFrom, nextValidUntil);

    if (payload.restaurantId !== undefined) {
      if (payload.restaurantId) {
        await this.assertRestaurantAccess(user, payload.restaurantId);
      } else if (user.role !== 'ADMIN') {
        throw new ForbiddenError('Only admins can convert coupons to global coupons');
      }
    }

    const code = payload.code ? this.normalizeCode(payload.code) : undefined;
    if (code && code !== coupon.code) {
      const existingCoupon = await prisma.coupon.findUnique({ where: { code } });
      if (existingCoupon) {
        throw new ConflictError('Coupon code already exists');
      }
    }

    if (
      payload.usageLimit !== undefined &&
      payload.usageLimit !== null &&
      payload.usageLimit < coupon.usedCount
    ) {
      throw new BadRequestError('Usage limit cannot be less than current used count');
    }

    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        code,
        description: payload.description,
        type: payload.type,
        discountValue: payload.discountValue,
        minOrderValue: payload.minOrderValue,
        maxDiscount: payload.maxDiscount === undefined ? undefined : payload.maxDiscount,
        validFrom: payload.validFrom,
        validUntil: payload.validUntil,
        usageLimit: payload.usageLimit === undefined ? undefined : payload.usageLimit,
        restaurantId: payload.restaurantId === undefined ? undefined : payload.restaurantId,
        isActive: payload.isActive,
        updatedById: user.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  static async deleteCoupon(user: AuthUser, couponId: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      include: { restaurant: true },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    this.assertCouponAccess(user, coupon.restaurant?.ownerId, coupon.restaurantId);

    return prisma.coupon.delete({
      where: { id: couponId },
    });
  }

  static async applyCoupon(payload: ApplyCouponPayload) {
    const code = this.normalizeCode(payload.code);
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!coupon) {
      throw new NotFoundError('Coupon not found');
    }

    if (coupon.deletedAt) {
      throw new NotFoundError('Coupon not found');
    }

    if (!coupon.isActive) {
      throw new BadRequestError('Coupon is not active');
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      throw new BadRequestError('Coupon is not active yet');
    }

    if (coupon.validUntil < now) {
      throw new BadRequestError('Coupon has expired');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestError('Coupon usage limit reached');
    }

    if (
      coupon.restaurantId &&
      payload.restaurantId &&
      coupon.restaurantId !== payload.restaurantId
    ) {
      throw new BadRequestError('Coupon is not valid for this restaurant');
    }

    if (coupon.restaurantId && !payload.restaurantId) {
      throw new BadRequestError('Restaurant is required for this coupon');
    }

    if (payload.orderAmount < Number(coupon.minOrderValue)) {
      throw new BadRequestError(
        `Minimum order value for this coupon is ${String(coupon.minOrderValue)}`
      );
    }

    const discountAmount = this.calculateDiscount(
      payload.orderAmount,
      coupon.type,
      Number(coupon.discountValue),
      coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined
    );
    const payableAmount = Math.max(payload.orderAmount - discountAmount, 0);

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        restaurant: coupon.restaurant,
      },
      orderAmount: payload.orderAmount,
      discountAmount,
      payableAmount,
    };
  }

  private static normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private static assertValidDateRange(validFrom: Date, validUntil: Date) {
    if (validUntil <= validFrom) {
      throw new BadRequestError('Coupon validUntil must be after validFrom');
    }
  }

  private static assertValidDiscount(type: CouponType, discountValue: number) {
    if (type === 'PERCENTAGE' && discountValue > 100) {
      throw new BadRequestError('Percentage coupon discount cannot exceed 100');
    }
  }

  private static calculateDiscount(
    orderAmount: number,
    type: CouponType,
    discountValue: number,
    maxDiscount?: number
  ) {
    const rawDiscount = type === 'PERCENTAGE' ? (orderAmount * discountValue) / 100 : discountValue;
    const cappedDiscount = maxDiscount ? Math.min(rawDiscount, maxDiscount) : rawDiscount;
    return Math.min(cappedDiscount, orderAmount);
  }

  private static async assertRestaurantAccess(user: AuthUser, restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (user.role !== 'ADMIN' && restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to manage coupons for this restaurant');
    }
  }

  private static assertCouponAccess(
    user: AuthUser,
    ownerId?: string,
    restaurantId?: string | null
  ): void {
    if (user.role === 'ADMIN') {
      return;
    }

    if (!restaurantId) {
      throw new ForbiddenError('Only admins can manage global coupons');
    }

    if (ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to manage this coupon');
    }
  }
}
