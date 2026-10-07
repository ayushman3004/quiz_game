import { Router } from 'express';
import { generateAiQuiz } from '../controllers/aiController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/generate-quiz', authenticate, generateAiQuiz);

export default router;
