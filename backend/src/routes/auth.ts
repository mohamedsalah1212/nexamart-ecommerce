import { Router } from 'express';
import { login, getMe, customerRegister, customerLogin, getCustomerProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getMe);

router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);
router.post('/customer/me', getCustomerProfile);

export default router;
