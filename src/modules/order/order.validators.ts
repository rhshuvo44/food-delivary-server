import { z } from 'zod';

const orderStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']);
const paymentMethodSchema = z.enum(['CASH', 'CARD', 'WALLET', 'ONLINE']);

const orderItemSchema = z.object({
    foodId: z.string().uuid(),
    quantity: z.number().int().min(1),
});

export const orderValidators = {
    createOrderSchema: z.object({
        body: z.object({
            restaurantId: z.string().uuid(),
            addressId: z.string().uuid(),
            couponId: z.string().uuid().optional(),
            paymentMethod: paymentMethodSchema.optional(),
            deliveryFee: z.number().nonnegative().optional(),
            taxAmount: z.number().nonnegative().optional(),
            discountAmount: z.number().nonnegative().optional(),
            tipAmount: z.number().nonnegative().optional(),
            instructions: z.string().optional(),
            items: z.array(orderItemSchema).min(1),
        }),
    }),

    updateOrderSchema: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
        body: z.object({
            addressId: z.string().uuid().optional(),
            couponId: z.string().uuid().nullable().optional(),
            paymentMethod: paymentMethodSchema.optional(),
            deliveryFee: z.number().nonnegative().optional(),
            taxAmount: z.number().nonnegative().optional(),
            discountAmount: z.number().nonnegative().optional(),
            tipAmount: z.number().nonnegative().optional(),
            instructions: z.string().optional(),
            items: z.array(orderItemSchema).min(1).optional(),
        }),
    }),

    updateOrderStatusSchema: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
        body: z.object({
            status: orderStatusSchema,
            note: z.string().optional(),
        }),
    }),

    getOrdersSchema: z.object({
        query: z.object({
            page: z.coerce.number().int().min(1).optional(),
            limit: z.coerce.number().int().min(1).optional(),
            userId: z.string().uuid().optional(),
            restaurantId: z.string().uuid().optional(),
            status: orderStatusSchema.optional(),
        }),
    }),

    orderIdParamsSchema: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
    }),
};
