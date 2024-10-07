const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');
const rateLimit = require('express-rate-limit');
const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRouters');
const bookingRouter = require('./routes/bookingRouters');
const compression = require('compression');
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./ults/appError');
const globalErrorHandler = require('./controllers/errorController');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const cors = require('cors');

// const { whitelist } = require('validator');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//1. global middleware
//set security http header
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        'ws://127.0.0.1:52768/',
        'https://api.stripe.com/',
      ],
      scriptSrc: [
        "'self'",
        'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
        'https://js.stripe.com/',
      ],
      frameSrc: ["'self'", 'https://js.stripe.com'],
    },
  }),
);

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
//body paraser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//Data sanitizaiton against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS

app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
//serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use((req, res, next) => {
  // console.log('Hello From the middleware');
  next();
});
//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//Route handle

// app.get('/api/v1/tours', getTour);
// '/api/v1/tours/:id/:x/:y?'
// app.get('/api/v1/tours/:id', (req, res) => {
//   const id = req.params.id * 1;

//   const tour = tours.find((el) => el.id === id);

//   console.log(req.params);
//   //   if (id > tours.length) {

//   if (!tour) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'Invalid ID',
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

//Routes
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/tours/:id', tourRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Could not find ${req.originalUrl} on this server`,
  // });
  next(new AppError(`Could not find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
