import { Router } from 'express';
import {
  getBanners, getActiveBanners, createBanner,
  updateBanner, deleteBanner, reorderBanners,
} from '../controllers/bannerController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getBanners);
router.get('/active', getActiveBanners);
router.post('/', authenticate, createBanner);
router.put('/:id', authenticate, updateBanner);
router.delete('/:id', authenticate, deleteBanner);
router.put('/reorder/all', authenticate, reorderBanners);

export default router;
