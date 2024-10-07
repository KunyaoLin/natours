const express = require('express');
const reviewController = require('../controllers/reviewController');
const reviewRouter = express.Router({ mergeParams: true });
const authController = require('../controllers/authController');
reviewRouter.use(authController.protect);
reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(reviewController.deleteReview);
module.exports = reviewRouter;
