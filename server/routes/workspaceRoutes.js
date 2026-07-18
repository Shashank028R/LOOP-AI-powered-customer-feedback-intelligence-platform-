import express from 'express';
import { 
  getWorkspaceStats, 
  getMembers, 
  inviteMember, 
  updateMember, 
  removeMember 
} from '../controllers/workspaceController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getWorkspaceStats);

// Members management routes (ADMIN only)
router.get('/members', protect, restrictTo('ADMIN'), getMembers);
router.post('/members/invite', protect, restrictTo('ADMIN'), inviteMember);
router.put('/members/:userId', protect, restrictTo('ADMIN'), updateMember);
router.delete('/members/:userId', protect, restrictTo('ADMIN'), removeMember);

export default router;
