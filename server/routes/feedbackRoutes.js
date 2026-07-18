import express from 'express';
import { 
  getFeedbacks, 
  createFeedback, 
  bulkCSVUpload, 
  simulateIngestion, 
  updateFeedbackStatus, 
  reclassifyFeedbackEndpoint 
} from '../controllers/feedbackController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Define routes with auth protection and RBAC
router.get('/', protect, getFeedbacks);
router.post('/', protect, restrictTo('ADMIN', 'ANALYST'), createFeedback);
router.post('/bulk-csv', protect, restrictTo('ADMIN', 'ANALYST'), bulkCSVUpload);
router.post('/simulate', protect, restrictTo('ADMIN', 'ANALYST'), simulateIngestion);
router.put('/:id/status', protect, restrictTo('ADMIN', 'ANALYST'), updateFeedbackStatus);
router.post('/:id/reclassify', protect, restrictTo('ADMIN', 'ANALYST'), reclassifyFeedbackEndpoint);

export default router;
