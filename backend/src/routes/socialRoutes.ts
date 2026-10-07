import { Router } from 'express';
import {
  searchUsers,
  getFriends,
  sendFriendRequest,
  respondFriendRequest,
  getClubs,
  createClub,
  joinClub,
  getLeaderboards,
} from '../controllers/socialController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/users/search', authenticate, searchUsers);
router.get('/friends', authenticate, getFriends);
router.post('/friends/request', authenticate, sendFriendRequest);
router.post('/friends/respond', authenticate, respondFriendRequest);

router.get('/clubs', authenticate, getClubs);
router.post('/clubs', authenticate, createClub);
router.post('/clubs/:id/join', authenticate, joinClub);

router.get('/leaderboards', authenticate, getLeaderboards);

export default router;
