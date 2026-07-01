import express from 'express';
import { getFoods, getFoodById, getFoodBySlug, createFoodReview, getFoodReviews, replyFoodReview, createFood, updateFood, deleteFood, checkCanReview, updateFoodReview } from '../controllers/foodController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getFoods).post(protect, admin, createFood);
router.route('/slug/:slug').get(getFoodBySlug);
router.route('/:id').get(getFoodById).put(protect, admin, updateFood).delete(protect, admin, deleteFood);
router.route('/:id/can-review').get(protect, checkCanReview);
router.route('/:id/reviews').get(getFoodReviews).post(protect, createFoodReview);
router.route('/:id/reviews/:reviewId').put(protect, updateFoodReview);
router.route('/:id/reviews/:reviewId/reply').put(protect, admin, replyFoodReview);

export default router;
