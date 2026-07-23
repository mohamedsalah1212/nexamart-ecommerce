import { Router } from 'express';
import {
  createOrder, getOrders, getOrder, updateOrderStatus,
  trackOrder, getDashboardStats, markNotificationsRead,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', createOrder);
router.get('/track/:orderId', trackOrder);
router.get('/dashboard', authenticate, getDashboardStats);
router.get('/', authenticate, getOrders);
router.get('/:orderId', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);
router.put('/notifications/read', authenticate, markNotificationsRead);

export default router;
