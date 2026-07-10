export const couponPermissions = {
  createCoupon: ['RESTAURANT_OWNER', 'ADMIN'],
  updateCoupon: ['RESTAURANT_OWNER', 'ADMIN'],
  deleteCoupon: ['RESTAURANT_OWNER', 'ADMIN'],
  applyCoupon: ['CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN'],
};
