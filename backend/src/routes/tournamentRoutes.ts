import { Router } from 'express';
import { getTournaments, registerForTournament } from '../controllers/tournamentController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', getTournaments);
router.post('/:id/register', authenticate, registerForTournament);

export default router;
