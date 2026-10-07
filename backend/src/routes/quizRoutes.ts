import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  getSoloQuestions,
  submitSoloQuiz,
  getJourneyTree,
  getDailyChallenge,
  getQuizMasters,
} from '../controllers/quizController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getQuizzes);
router.get('/journey/tree', getJourneyTree);
router.get('/daily-challenge', getDailyChallenge);
router.get('/creators', getQuizMasters);
router.get('/:id', getQuizById);
router.get('/:id/play-solo', getSoloQuestions);
router.post('/:id/submit-solo', authenticate, submitSoloQuiz);

export default router;
