import { Router } from 'express';
import {
  getCategories, getCategory, createCategory,
  updateCategory, deleteCategory, reorderCategories,
} from '../controllers/categoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);
router.put('/reorder/all', authenticate, reorderCategories);

export default router;
