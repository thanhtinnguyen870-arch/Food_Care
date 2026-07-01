import express from 'express';
import { getDashboardStats, getAdminOrders, updateOrderStatus, getAdminUsers, getAdminFoods, updateUserRole, updateUserBlockStatus, updateUserInfo, getNotifications, markNotificationAsRead } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/orders').get(protect, admin, getAdminOrders);
router.route('/orders/:id/status').put(protect, admin, updateOrderStatus);
router.route('/users').get(protect, admin, getAdminUsers);
router.route('/users/:id').put(protect, admin, updateUserInfo);
router.route('/users/:id/role').put(protect, admin, updateUserRole);
router.route('/users/:id/block').put(protect, admin, updateUserBlockStatus);
router.route('/foods').get(protect, admin, getAdminFoods);
router.route('/notifications').get(protect, admin, getNotifications);
router.route('/notifications/:id/read').put(protect, admin, markNotificationAsRead);

export default router;
