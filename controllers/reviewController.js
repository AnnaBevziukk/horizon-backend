import Review from '../models/reviewModel.js';
//import catchAsync from '../utils/catchAsync.js';
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory.js';

export const setTourAndUserIDs = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const createReview = createOne(Review);
export const getAllReviews = getAll(Review);
export const deleteReview = deleteOne(Review);
export const updateReview = updateOne(Review);
export const getReview = getOne(Review);
export default {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserIDs,
  getReview,
};
