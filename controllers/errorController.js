const AppError = require('../ults/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field values: ${value} Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpireError = () => {
  new AppError('Your token has expired! please login again', 401);
};
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      console.log('ERROR💥', err);

      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log('ERROR💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
  console.log('ERROR💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'please try again',
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    // error = handleCastErrorDB(error);

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    // if (error.name === 'CastError') {
    // error = handleCastErrorDB(error);
    if (error.name === 'validationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError();
    // }
    sendErrorProd(error, req, res);
  }
};
