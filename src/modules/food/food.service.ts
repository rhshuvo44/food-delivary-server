import prisma from '../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export interface CreateFoodPayload {
  restaurantId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  calories?: number;
  preparationTime?: number;
  imageUrl?: string;
}

export interface UpdateFoodPayload {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  calories?: number;
  preparationTime?: number;
  imageUrl?: string;
}

export interface FoodQuery {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  restaurantId?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt' | 'preparationTime';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export class FoodService {
  static async createFood(user: { id: string; role: string }, payload: CreateFoodPayload) {
    // Verify restaurant exists and user has permission
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: payload.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (user.role !== 'ADMIN' && restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to add food to this restaurant');
    }

    // Verify category if provided
    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: payload.categoryId },
      });

      if (!category || category.restaurantId !== payload.restaurantId) {
        throw new NotFoundError('Category not found in this restaurant');
      }
    }

    return prisma.food.create({
      data: {
        restaurantId: payload.restaurantId,
        categoryId: payload.categoryId,
        name: payload.name,
        description: payload.description,
        price: payload.price,
        isAvailable: payload.isAvailable ?? true,
        isFeatured: payload.isFeatured ?? false,
        calories: payload.calories,
        preparationTime: payload.preparationTime,
        imageUrl: payload.imageUrl,
        createdById: user.id,
        updatedById: user.id,
      },
    });
  }

  static async updateFood(
    user: { id: string; role: string },
    foodId: string,
    payload: UpdateFoodPayload
  ) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
      include: { restaurant: true },
    });

    if (!food) {
      throw new NotFoundError('Food not found');
    }

    if (user.role !== 'ADMIN' && food.restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this food');
    }

    // Verify category if provided
    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: payload.categoryId },
      });

      if (!category || category.restaurantId !== food.restaurantId) {
        throw new NotFoundError('Category not found in this restaurant');
      }
    }

    return prisma.food.update({
      where: { id: foodId },
      data: {
        ...payload,
        updatedById: user.id,
      },
    });
  }

  static async deleteFood(user: { id: string; role: string }, foodId: string) {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
      include: { restaurant: true },
    });

    if (!food) {
      throw new NotFoundError('Food not found');
    }

    if (user.role !== 'ADMIN' && food.restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this food');
    }

    return prisma.food.delete({
      where: { id: foodId },
    });
  }

  static async getFoods(query: FoodQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Record<string, unknown> = {};

    if (query.restaurantId) {
      Object.assign(where, { restaurantId: query.restaurantId });
    }

    if (query.categoryId) {
      Object.assign(where, { categoryId: query.categoryId });
    }

    if (query.isAvailable !== undefined) {
      Object.assign(where, { isAvailable: query.isAvailable });
    }

    if (query.isFeatured !== undefined) {
      Object.assign(where, { isFeatured: query.isFeatured });
    }

    const searchQuery = query.search || query.name;
    if (searchQuery) {
      Object.assign(where, {
        name: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      });
    }

    // Price range filtering
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice !== undefined) {
        priceFilter.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        priceFilter.lte = query.maxPrice;
      }
      Object.assign(where, { price: priceFilter });
    }

    const totalItems = await prisma.food.count({ where });
    const foods = await prisma.food.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      foods,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      },
    };
  }
}
