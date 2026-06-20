import prisma from "../../config/prisma";
import { Prisma } from "../../generated/prisma/client";
import { OrderStatus, PaymentMethod } from "../../generated/prisma/enums";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors";

type AuthUser = { id: string; role: string };

interface OrderItemPayload {
    foodId: string;
    quantity: number;
}

export interface CreateOrderPayload {
    restaurantId: string;
    addressId: string;
    couponId?: string;
    paymentMethod?: PaymentMethod;
    deliveryFee?: number;
    taxAmount?: number;
    discountAmount?: number;
    tipAmount?: number;
    instructions?: string;
    items: OrderItemPayload[];
}

export interface UpdateOrderPayload {
    addressId?: string;
    couponId?: string | null;
    paymentMethod?: PaymentMethod;
    deliveryFee?: number;
    taxAmount?: number;
    discountAmount?: number;
    tipAmount?: number;
    instructions?: string;
    items?: OrderItemPayload[];
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
    note?: string;
}

export interface OrderQuery {
    page?: number;
    limit?: number;
    userId?: string;
    restaurantId?: string;
    status?: string;
}

const orderInclude = {
    user: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
        },
    },
    restaurant: {
        select: {
            id: true,
            name: true,
            ownerId: true,
        },
    },
    address: true,
    items: {
        include: {
            food: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    price: true,
                },
            },
        },
    },
    history: {
        orderBy: {
            createdAt: 'desc',
        },
    },
} satisfies Prisma.OrderInclude;

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERED', 'CANCELLED'],
    DELIVERED: [],
    CANCELLED: [],
};

export class OrderService {
    static async createOrder(user: AuthUser, payload: CreateOrderPayload) {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: payload.restaurantId },
        });

        if (!restaurant) {
            throw new NotFoundError('Restaurant not found');
        }

        const address = await prisma.address.findUnique({
            where: { id: payload.addressId },
        });

        if (!address) {
            throw new NotFoundError('Address not found');
        }

        if (user.role !== 'ADMIN' && address.userId !== user.id) {
            throw new ForbiddenError('You do not have permission to use this address');
        }

        const { orderItems, subTotal } = await this.buildOrderItems(payload.restaurantId, payload.items);
        const totals = this.calculateTotals(subTotal, payload);

        return prisma.$transaction(async tx => {
            const order = await tx.order.create({
                data: {
                    userId: user.id,
                    restaurantId: payload.restaurantId,
                    addressId: payload.addressId,
                    couponId: payload.couponId,
                    paymentMethod: payload.paymentMethod ?? 'ONLINE',
                    subTotal: totals.subTotal,
                    deliveryFee: totals.deliveryFee,
                    taxAmount: totals.taxAmount,
                    discountAmount: totals.discountAmount,
                    totalAmount: totals.totalAmount,
                    tipAmount: totals.tipAmount,
                    instructions: payload.instructions,
                    createdById: user.id,
                    updatedById: user.id,
                    items: {
                        create: orderItems,
                    },
                    history: {
                        create: {
                            currentStatus: 'PENDING',
                            note: 'Order placed',
                            changedById: user.id,
                        },
                    },
                },
                include: orderInclude,
            });

            return order;
        });
    }

    static async updateOrder(user: AuthUser, orderId: string, payload: UpdateOrderPayload) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (user.role !== 'ADMIN' && order.userId !== user.id) {
            throw new ForbiddenError('You do not have permission to update this order');
        }

        if (!['PENDING', 'ACCEPTED'].includes(order.orderStatus)) {
            throw new BadRequestError('Only pending or accepted orders can be updated');
        }

        if (payload.addressId) {
            await this.assertAddressAccess(user, payload.addressId);
        }

        const itemUpdate = payload.items
            ? await this.buildOrderItems(order.restaurantId, payload.items)
            : {
                  orderItems: order.items.map(item => ({
                      foodId: item.foodId,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice,
                      totalPrice: item.totalPrice,
                  })),
                  subTotal: Number(order.subTotal),
              };

        const totals = this.calculateTotals(itemUpdate.subTotal, {
            deliveryFee: payload.deliveryFee ?? Number(order.deliveryFee),
            taxAmount: payload.taxAmount ?? Number(order.taxAmount),
            discountAmount: payload.discountAmount ?? Number(order.discountAmount),
            tipAmount: payload.tipAmount ?? Number(order.tipAmount),
        });

        return prisma.$transaction(async tx => {
            if (payload.items) {
                await tx.orderItem.deleteMany({ where: { orderId } });
            }

            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    addressId: payload.addressId,
                    couponId: payload.couponId === undefined ? undefined : payload.couponId,
                    paymentMethod: payload.paymentMethod,
                    deliveryFee: totals.deliveryFee,
                    taxAmount: totals.taxAmount,
                    discountAmount: totals.discountAmount,
                    tipAmount: totals.tipAmount,
                    subTotal: totals.subTotal,
                    totalAmount: totals.totalAmount,
                    instructions: payload.instructions,
                    updatedById: user.id,
                    items: payload.items
                        ? {
                              create: itemUpdate.orderItems,
                          }
                        : undefined,
                },
                include: orderInclude,
            });

            return updatedOrder;
        });
    }

    static async deleteOrder(user: AuthUser, orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (user.role !== 'ADMIN' && order.userId !== user.id) {
            throw new ForbiddenError('You do not have permission to delete this order');
        }

        if (!['PENDING', 'CANCELLED'].includes(order.orderStatus)) {
            throw new BadRequestError('Only pending or cancelled orders can be deleted');
        }

        return prisma.$transaction(async tx => {
            await tx.orderHistory.deleteMany({ where: { orderId } });
            await tx.orderItem.deleteMany({ where: { orderId } });
            return tx.order.delete({ where: { id: orderId } });
        });
    }

    static async getOrders(user: AuthUser, query: OrderQuery) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const where: Prisma.OrderWhereInput = {};

        if (query.status) {
            where.orderStatus = query.status as OrderStatus;
        }

        if (user.role === 'CUSTOMER') {
            where.userId = user.id;
        } else if (user.role === 'RESTAURANT_OWNER') {
            where.restaurant = { ownerId: user.id };
            if (query.restaurantId) {
                where.restaurantId = query.restaurantId;
            }
        } else {
            if (query.userId) {
                where.userId = query.userId;
            }
            if (query.restaurantId) {
                where.restaurantId = query.restaurantId;
            }
        }

        const totalItems = await prisma.order.count({ where });
        const orders = await prisma.order.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { placedAt: 'desc' },
            include: orderInclude,
        });

        return {
            orders,
            meta: {
                currentPage: page,
                perPage: limit,
                totalItems,
                totalPages: Math.max(Math.ceil(totalItems / limit), 1),
            },
        };
    }

    static async getOrderById(user: AuthUser, orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: orderInclude,
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        this.assertOrderAccess(user, order.userId, order.restaurant.ownerId);
        return order;
    }

    static async updateOrderStatus(user: AuthUser, orderId: string, payload: UpdateOrderStatusPayload) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                restaurant: true,
            },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        if (user.role !== 'ADMIN' && user.role !== 'DELIVERY' && order.restaurant.ownerId !== user.id) {
            throw new ForbiddenError('You do not have permission to update this order status');
        }

        if (order.orderStatus === payload.status) {
            throw new BadRequestError('Order already has this status');
        }

        if (!allowedTransitions[order.orderStatus].includes(payload.status)) {
            throw new BadRequestError(`Cannot update order status from ${order.orderStatus} to ${payload.status}`);
        }

        return prisma.$transaction(async tx => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    orderStatus: payload.status,
                    deliveredAt: payload.status === 'DELIVERED' ? new Date() : undefined,
                    canceledAt: payload.status === 'CANCELLED' ? new Date() : undefined,
                    updatedById: user.id,
                },
                include: orderInclude,
            });

            await tx.orderHistory.create({
                data: {
                    orderId,
                    previousStatus: order.orderStatus,
                    currentStatus: payload.status,
                    note: payload.note,
                    changedById: user.id,
                },
            });

            return updatedOrder;
        });
    }

    static async getOrderHistory(user: AuthUser, orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                restaurant: true,
            },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        this.assertOrderAccess(user, order.userId, order.restaurant.ownerId);

        return prisma.orderHistory.findMany({
            where: { orderId },
            orderBy: { createdAt: 'asc' },
            include: {
                changedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });
    }

    private static async buildOrderItems(restaurantId: string, items: OrderItemPayload[]) {
        const quantityByFoodId = items.reduce<Record<string, number>>((acc, item) => {
            acc[item.foodId] = (acc[item.foodId] ?? 0) + item.quantity;
            return acc;
        }, {});

        const foodIds = Object.keys(quantityByFoodId);
        const foods = await prisma.food.findMany({
            where: {
                id: { in: foodIds },
                restaurantId,
                isAvailable: true,
            },
        });

        if (foods.length !== foodIds.length) {
            throw new BadRequestError('One or more foods are unavailable for this restaurant');
        }

        let subTotal = 0;
        const orderItems = foods.map(food => {
            const quantity = quantityByFoodId[food.id];
            const unitPrice = Number(food.price);
            const totalPrice = unitPrice * quantity;
            subTotal += totalPrice;

            return {
                foodId: food.id,
                quantity,
                unitPrice: food.price,
                totalPrice,
            };
        });

        return { orderItems, subTotal };
    }

    private static calculateTotals(
        subTotal: number,
        payload: {
            deliveryFee?: number;
            taxAmount?: number;
            discountAmount?: number;
            tipAmount?: number;
        },
    ) {
        const deliveryFee = payload.deliveryFee ?? 0;
        const taxAmount = payload.taxAmount ?? 0;
        const discountAmount = payload.discountAmount ?? 0;
        const tipAmount = payload.tipAmount ?? 0;
        const totalAmount = subTotal + deliveryFee + taxAmount + tipAmount - discountAmount;

        if (totalAmount < 0) {
            throw new BadRequestError('Order total cannot be negative');
        }

        return {
            subTotal,
            deliveryFee,
            taxAmount,
            discountAmount,
            tipAmount,
            totalAmount,
        };
    }

    private static async assertAddressAccess(user: AuthUser, addressId: string) {
        const address = await prisma.address.findUnique({ where: { id: addressId } });

        if (!address) {
            throw new NotFoundError('Address not found');
        }

        if (user.role !== 'ADMIN' && address.userId !== user.id) {
            throw new ForbiddenError('You do not have permission to use this address');
        }
    }

    private static assertOrderAccess(user: AuthUser, orderUserId: string, restaurantOwnerId: string) {
        if (user.role === 'ADMIN' || user.role === 'DELIVERY') {
            return;
        }

        if (user.role === 'CUSTOMER' && orderUserId === user.id) {
            return;
        }

        if (user.role === 'RESTAURANT_OWNER' && restaurantOwnerId === user.id) {
            return;
        }

        throw new ForbiddenError('You do not have permission to access this order');
    }
}
