// const catchAsync = require('../ults/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handleFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   if (!reviews) next(new AppError('Something wrong in getting review!', 404));
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.find(req.body.id);
//   if (!review) next(new AppError('Something wrong in getting review!', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
