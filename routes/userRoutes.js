import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/me', authController.protect, getMe, getUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.get('/logout', (req, res) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000), // Cookie буде знищена через 10 секунд
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'You are now logged out!',
  });
});

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
//protect all routes down
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.patch('/updateMe', updateMe);

router.delete('/deleteMe', deleteMe);
router.use(authController.restrictTO('admin'));
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
