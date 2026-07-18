import express from 'express';
import { getAIThemes, getAIThemeTrends } from '../controllers/aiThemeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAIThemes);
router.get('/trends', protect, getAIThemeTrends);

export default router;
