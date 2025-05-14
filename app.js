import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';
import path from 'path'; // Додайте цей рядок

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import reviewRouter from './routes/reviewRoutes.js';
import cookieParser from 'cookie-parser';
import paymentRoutes from './routes/paymentRoutes.js';

import globalErrorHandler from './controllers/errorController.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:3000', // Дозволяємо доступ лише з цього домену
  credentials: true, // Дозволяємо передавати куки
};

app.use(cors(corsOptions));

// GLOBAL MIDDLEWARES
//sey serurity HTTP headers
app.use(helmet());

//developming loggin
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/img/tours', express.static(path.join(__dirname, 'img/tours')));

app.use('/public', express.static(path.join(__dirname, 'public')));

//limit req from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too mane request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanatization against NOSQL query
app.use(mongoSanitize());
//Data sanatization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//serving static files
app.use(express.static(`${__dirname}/public`));
//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
