import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../utils/errors';

type AuthUser = { id: string; role: string };

export interface CreateReviewPayload {
  orderId: string;
  foodId?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string | null;
  comment?: string | null;
}

const reviewInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  },
  restaurant: {
    select: {
      id: true,
      name: true,
    },
  },
  food: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
  order: {
    select: {
      id: true,
      orderStatus: true,
      deliveredAt: true,
    },
  },
} satisfies Prisma.ReviewInclude;

export class ReviewService {
  static async createReview(user: AuthUser, payload: CreateReviewPayload) {
    const order = await prisma.order.findUnique({
      where: { id: payload.orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== user.id) {
      throw new ForbiddenError('You can review only your own orders');
    }

    if (order.orderStatus !== 'DELIVERED') {
      throw new BadRequestError('You can review only completed orders');
    }

    if (payload.foodId && !order.items.some((item) => item.foodId === payload.foodId)) {
      throw new BadRequestError('You can review only foods included in this order');
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        orderId: payload.orderId,
        restaurantId: order.restaurantId,
        foodId: payload.foodId ?? null,
        deletedAt: null,
      },
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this order target');
    }

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: user.id,
          orderId: payload.orderId,
          restaurantId: order.restaurantId,
          foodId: payload.foodId,
          rating: payload.rating,
          title: payload.title,
          comment: payload.comment,
          isVerified: true,
        },
        include: reviewInclude,
      });

      await this.refreshRestaurantRating(tx, order.restaurantId);
      return review;
    });
  }

  static async updateReview(user: AuthUser, reviewId: string, payload: UpdateReviewPayload) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.deletedAt) {
      throw new NotFoundError('Review not found');
    }

    if (user.role !== 'ADMIN' && review.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this review');
    }

    return prisma.$transaction(async (tx) => {
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: payload.rating,
          title: payload.title === undefined ? undefined : payload.title,
          comment: payload.comment === undefined ? undefined : payload.comment,
        },
        include: reviewInclude,
      });

      if (review.restaurantId) {
        await this.refreshRestaurantRating(tx, review.restaurantId);
      }

      return updatedReview;
    });
  }

  static async deleteReview(user: AuthUser, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.deletedAt) {
      throw new NotFoundError('Review not found');
    }

    if (user.role !== 'ADMIN' && review.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this review');
    }

    return prisma.$transaction(async (tx) => {
      const deletedReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          deletedAt: new Date(),
        },
      });

      if (review.restaurantId) {
        await this.refreshRestaurantRating(tx, review.restaurantId);
      }

      return deletedReview;
    });
  }

  private static async refreshRestaurantRating(tx: Prisma.TransactionClient, restaurantId: string) {
    const result = await tx.review.aggregate({
      where: {
        restaurantId,
        deletedAt: null,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: result._avg.rating ?? 0,
      },
    });
  }
}
