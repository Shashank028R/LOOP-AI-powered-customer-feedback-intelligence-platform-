import express from 'express';
import { askLOOP } from '../controllers/insightsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', protect, askLOOP);

export default router;
