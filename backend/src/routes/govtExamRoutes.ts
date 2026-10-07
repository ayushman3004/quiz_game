import { Router } from 'express';
import { getExamCategories, getExamMockTests } from '../controllers/govtExamController';

const router = Router();

router.get('/categories', getExamCategories);
router.get('/:category/mock-tests', getExamMockTests);

export default router;
