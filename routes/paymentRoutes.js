import express from 'express';
import { createLiqPayPayment } from '../controllers/liqpayController.js';

const router = express.Router();

router.post('/create-payment', createLiqPayPayment);

export default router;
