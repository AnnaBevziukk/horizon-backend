import express from 'express';
import reviewController from '../controllers/reviewController.js';
import authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTO('user'),
    reviewController.setTourAndUserIDs,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTO('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictTO('user', 'admin'),
    reviewController.updateReview,
  );
export default router;
