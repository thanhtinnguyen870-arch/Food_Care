import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateHealthProfile,
  changePassword,
  loginWithGoogle,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', loginWithGoogle);
router.route('/me').get(protect, getUserProfile);
router.route('/profile').put(protect, updateUserProfile);
router.route('/change-password').put(protect, changePassword);
router.route('/health-profile').put(protect, updateHealthProfile);
router.route('/favorites').get(protect, getFavorites);
router.route('/favorites/:foodId').post(protect, addFavorite).delete(protect, removeFavorite);

export default router;
