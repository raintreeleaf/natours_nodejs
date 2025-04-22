const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = (err) =>
  new AppError('Invalid Token! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err,
    stack: err.stack,
    status: err.status,
    message: err.message,
  });
};
const handleJWTExpiredError = (err) =>
  new AppError('Your token has expired! Please log in again', 401);
const sendErrorProd = (err, res) => {
  //operational, trusted error: send message to client
  if (err.isOperational)
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  //Programming or unknown error: don't leak details to client
  else {
    //1: log error
    //2: send generic message
    res
      .status(500)
      .json({ message: 'Something has gone wrong!', status: 'error' });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    sendErrorDev(err, res);
    // next();
  }
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name };
    //Note: using spread operator will only spread properties that are enumberable
    //ie, properties that can be reached by for..in loop. You can check using Object.objecIsEnumerable function
    //for objects, __proto__ is not enumerable, so using spread will not give you the err __proto__.
    //Using Object.getOwnPropertyNames does not work because __proto__ is inherited.

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    //wrong id error is generated from mongoose.
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // duplicate error is generated from mongoose db driver. Apparently the "code" property is enumerable.
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
    // next();
  }
};
