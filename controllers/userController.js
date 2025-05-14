import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const updateMe = catchAsync(async (req, res, next) => {
  // Перевірка на порожнє ім'я
  if (!req.body.name || req.body.name.trim() === '') {
    return next(new AppError('Name cannot be empty', 400)); // Помилка, якщо ім'я порожнє
  }

  // Перевірка, чи змінився email
  if (req.body.email && req.body.email !== req.user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return next(
        new AppError(
          'This email is already taken. Please use another one.',
          400,
        ),
      ); // Помилка, якщо email вже існує
    }
  }

  // Перевірка, чи намагаються оновити пароль
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates! Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // Фільтруємо поля, які дозволено оновлювати
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Оновлюємо користувача
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: "this route isn't available now! Use signUp instead",
  });
};
//dont update pass with this
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);
export const getAllUsers = getAll(User);
export const getUser = getOne(User);
