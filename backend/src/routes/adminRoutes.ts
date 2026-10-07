import { Router } from 'express';
import {
  getAdminStats,
  listUsersAdmin,
  toggleBanUser,
  approveQuiz,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middlewares/auth';
import { UserRole } from '../constants';

const router = Router();

router.use(authenticate);
router.use(requireRole(UserRole.ADMIN, UserRole.MODERATOR));

router.get('/stats', getAdminStats);
router.get('/users', listUsersAdmin);
router.patch('/users/:id/ban', toggleBanUser);
router.patch('/quizzes/:id/approve', approveQuiz);

export default router;
