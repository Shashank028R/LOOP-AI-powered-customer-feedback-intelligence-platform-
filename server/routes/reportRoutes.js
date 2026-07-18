import express from 'express';
import { getReports, generateReport, getReportById } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getReports);
router.post('/generate', protect, restrictTo('ADMIN', 'ANALYST'), generateReport);
router.get('/:id', protect, getReportById);

export default router;
