import { Router } from 'express';
import {
  getWishlist, addToWishlist, removeFromWishlist, checkWishlist,
} from '../controllers/wishlistController';

const router = Router();

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.get('/check/:productId', checkWishlist);

export default router;
