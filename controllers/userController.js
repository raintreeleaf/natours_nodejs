const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    // requestedAt: req.requestTime,
    data: { users },
  });
});
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is yet to be defined' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is yet to be defined' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is yet to be defined' });
};
