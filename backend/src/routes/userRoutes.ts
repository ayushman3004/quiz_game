import { Router } from 'express';
import { updateProfile, getUserById, getMatchHistory } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.patch('/profile', authenticate, updateProfile);
router.get('/history', authenticate, getMatchHistory);
router.get('/:id', authenticate, getUserById);

export default router;
