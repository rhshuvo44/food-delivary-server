export const orderPermissions = {
    createOrder: ['CUSTOMER', 'ADMIN'],
    updateOrder: ['CUSTOMER', 'ADMIN'],
    deleteOrder: ['CUSTOMER', 'ADMIN'],
    getOrders: ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY', 'ADMIN'],
    getOrder: ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY', 'ADMIN'],
    updateOrderStatus: ['RESTAURANT_OWNER', 'DELIVERY', 'ADMIN'],
    getOrderHistory: ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY', 'ADMIN'],
};
