import express from 'express';
import authController from '../controllers/authController.js';
import {
  createBookingAfterLiqpay,
  getMyBookedTours,
} from '../controllers/bookingController.js';

const router = express.Router();

// Додаємо захист, щоб тільки авторизований користувач міг створити бронювання
router.post(
  '/create-lp-booking',
  authController.protect,
  createBookingAfterLiqpay,
);

router.get('/my-tours', authController.protect, getMyBookedTours);
export default router;
