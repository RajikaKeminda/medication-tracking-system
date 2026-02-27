import { Router } from 'express';
import authRoutes from './auth.routes';
import orderRoutes from './order.routes';
import requestRoutes from './request.routes';
import pharmacyRoutes from './pharmacy.routes';
import inventoryRoutes from './inventory.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/requests', requestRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/inventory', inventoryRoutes);


export default router;
