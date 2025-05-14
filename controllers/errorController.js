/* eslint-disable prettier/prettier */
import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // ✅ Вказуємо статус
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value `;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const handleJWTError = () =>
  new AppError('invalid token. please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! please log in again', 401);

const sendErrorProd = (err, res) => {
  // оперативна довірена помилка: відправити повідомлення клієнту
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // логування помилки

    console.error('ERROR💥:', err);
    console.log('Status Code:', err.statusCode); // Логування статус-коду

    // надто для програмної помилки або іншої невідомої помилки: не розкривати деталі помилки
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong! :(',
    });
  }
};
export default (err, req, res, next) => {
  //   console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') {
      console.log('BEFORE HANDLE:', err.message);
      error = handleValidationErrorDB(err);
      console.log('AFTER HANDLE:', error.message);
    }
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
