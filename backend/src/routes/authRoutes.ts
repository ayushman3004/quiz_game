import { Router } from 'express';
import { register, login, firebaseSync, getMe } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/sync', firebaseSync);
router.get('/me', authenticate, getMe);

export default router;
