import { Router } from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, duplicateProduct, uploadProductMedia,
  deleteMedia, reorderMedia, getRelatedProducts,
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/:slug', getProduct);
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.post('/:id/duplicate', authenticate, duplicateProduct);
router.post('/:productId/media', authenticate, upload.array('files', 20), uploadProductMedia);
router.delete('/media/:id', authenticate, deleteMedia);
router.put('/media/reorder', authenticate, reorderMedia);

export default router;
