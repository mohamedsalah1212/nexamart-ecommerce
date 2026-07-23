import { Router } from 'express';
import {
  getReviews, createReview, getAllReviews,
  approveReview, hideReview, deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getReviews);
router.post('/', createReview);
router.get('/all/admin', authenticate, getAllReviews);
router.put('/:id/approve', authenticate, approveReview);
router.put('/:id/hide', authenticate, hideReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
