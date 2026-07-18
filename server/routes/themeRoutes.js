import express from 'express';
import { getTheme, saveTheme } from '../controllers/themeController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTheme);
router.post('/', protect, restrictTo('ADMIN'), saveTheme);

export default router;
