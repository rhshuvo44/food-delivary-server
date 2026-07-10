export const restaurantPermissions = {
  createRestaurant: ['RESTAURANT_OWNER'],
  updateRestaurant: ['RESTAURANT_OWNER', 'ADMIN'],
  approveRestaurant: ['ADMIN'],
  suspendRestaurant: ['ADMIN'],
};
