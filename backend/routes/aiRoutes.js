import express from 'express';
import { recommendFood, getChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/recommend').post(protect, recommendFood);
router.route('/history').get(protect, getChatHistory);

export default router;
