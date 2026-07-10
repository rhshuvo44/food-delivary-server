import prisma from '../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export interface CreateRestaurantPayload {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  cuisineType?: string;
  addressId?: string;
}

export interface UpdateRestaurantPayload {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  cuisineType?: string;
  addressId?: string;
  isOpen?: boolean;
}

export interface RestaurantQuery {
  page?: number;
  limit?: number;
  name?: string;
  cuisineType?: string;
  isOpen?: boolean;
  isActive?: boolean;
  ownerId?: string;
}

export class RestaurantService {
  static async createRestaurant(
    user: { id: string; role: string },
    payload: CreateRestaurantPayload
  ) {
    return prisma.restaurant.create({
      data: {
        ownerId: user.id,
        name: payload.name,
        description: payload.description,
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        logoUrl: payload.logoUrl,
        coverUrl: payload.coverUrl,
        cuisineType: payload.cuisineType,
        addressId: payload.addressId,
        createdById: user.id,
        updatedById: user.id,
      },
    });
  }

  static async updateRestaurant(
    user: { id: string; role: string },
    restaurantId: string,
    payload: UpdateRestaurantPayload
  ) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (user.role !== 'ADMIN' && restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this restaurant');
    }

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...payload,
        updatedById: user.id,
      },
    });
  }

  static async getRestaurants(query: RestaurantQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.name) {
      Object.assign(where, {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
      });
    }

    if (query.cuisineType) {
      Object.assign(where, { cuisineType: query.cuisineType });
    }

    if (query.isOpen !== undefined) {
      Object.assign(where, { isOpen: query.isOpen });
    }

    if (query.isActive !== undefined) {
      Object.assign(where, { isActive: query.isActive });
    }

    if (query.ownerId) {
      Object.assign(where, { ownerId: query.ownerId });
    }

    const totalItems = await prisma.restaurant.count({ where });
    const restaurants = await prisma.restaurant.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      restaurants,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      },
    };
  }

  static async approveRestaurant(restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive: true },
    });
  }

  static async suspendRestaurant(restaurantId: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isActive: false },
    });
  }
}
