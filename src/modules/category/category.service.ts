import prisma from '../../config/prisma';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

export interface CreateCategoryPayload {
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
  sortOrder?: number;
}

export interface CategoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  restaurantId?: string;
}

export class CategoryService {
  static async createCategory(user: { id: string; role: string }, payload: CreateCategoryPayload) {
    // Verify restaurant exists and user has permission
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: payload.restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }

    if (user.role !== 'ADMIN' && restaurant.ownerId !== user.id) {
      throw new ForbiddenError(
        'You do not have permission to create categories for this restaurant'
      );
    }

    return prisma.category.create({
      data: {
        restaurantId: payload.restaurantId,
        name: payload.name,
        description: payload.description,
        sortOrder: payload.sortOrder ?? 0,
        createdById: user.id,
        updatedById: user.id,
      },
    });
  }

  static async updateCategory(
    user: { id: string; role: string },
    categoryId: string,
    payload: UpdateCategoryPayload
  ) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { restaurant: true },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (user.role !== 'ADMIN' && category.restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this category');
    }

    return prisma.category.update({
      where: { id: categoryId },
      data: {
        ...payload,
        updatedById: user.id,
      },
    });
  }

  static async deleteCategory(user: { id: string; role: string }, categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { restaurant: true },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    if (user.role !== 'ADMIN' && category.restaurant.ownerId !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this category');
    }

    return prisma.category.delete({
      where: { id: categoryId },
    });
  }

  static async getCategories(query: CategoryQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Record<string, unknown> = {};

    if (query.restaurantId) {
      Object.assign(where, { restaurantId: query.restaurantId });
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

    const totalItems = await prisma.category.count({ where });
    const categories = await prisma.category.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return {
      categories,
      meta: {
        currentPage: page,
        perPage: limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      },
    };
  }
}
