import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);

export default router;
