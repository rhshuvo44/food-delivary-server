import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { bannerRoutes } from '../modules/banner/banner.routes';
import { categoryRoutes } from '../modules/category/category.routes';
import { couponRoutes } from '../modules/coupon/coupon.routes';
import { foodRoutes } from '../modules/food/food.routes';
import { orderRoutes } from '../modules/order/order.routes';
import restaurantRoutes from '../modules/restaurant/restaurant.routes';
import { reviewRoutes } from '../modules/review/review.routes';

const router = Router();
const moduleRoutes = [
  // {
  //     path: '/user',
  //     route: userRouter,
  // },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/banners',
    route: bannerRoutes,
  },
  {
    path: '/restaurants',
    route: restaurantRoutes,
  },
  {
    path: '/categories',
    route: categoryRoutes,
  },
  {
    path: '/foods',
    route: foodRoutes,
  },
  {
    path: '/coupons',
    route: couponRoutes,
  },
  {
    path: '/order',
    route: orderRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
