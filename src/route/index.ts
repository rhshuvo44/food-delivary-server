import { Router } from 'express';


const rootRouter = Router();

// Modular Route Registrations
// rootRouter.use('/restaurants', restaurantRouter);
// rootRouter.use('/foods', foodRouter);
// rootRouter.use('/orders', orderRouter);

// Stubs for remaining entities (Following the exact same blueprint above)
rootRouter.use('/users', (req, res) => res.json({ message: "User operations mapped." }));
rootRouter.use('/categories', (req, res) => res.json({ message: "Category operations mapped." }));
rootRouter.use('/coupons', (req, res) => res.json({ message: "Coupon management operations mapped." }));
rootRouter.use('/reviews', (req, res) => res.json({ message: "Review operations mapped." }));
rootRouter.use('/banners', (req, res) => res.json({ message: "Promotional banner operations mapped." }));

export default rootRouter;