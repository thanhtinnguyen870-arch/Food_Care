import express from 'express';
import { confirmMomoPaymentForDev, createMomoPayment, handleMomoIpn } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/momo/create').post(protect, createMomoPayment);
router.route('/momo/ipn').post(handleMomoIpn);
router.route('/momo/dev-confirm').post(protect, confirmMomoPaymentForDev);

export default router;
