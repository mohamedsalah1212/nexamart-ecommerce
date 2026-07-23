import { Router } from 'express';
import { getSettings, updateSettings, getHomepageSections, updateHomepageSection } from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, updateSettings);
router.get('/sections', getHomepageSections);
router.put('/sections/:section', authenticate, updateHomepageSection);

export default router;
