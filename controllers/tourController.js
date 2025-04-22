const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );
//return statement is necessary. otherwise function will continue to run
//and express will complain that you are sending headers after response has been sent.
// exports.checkId = (req, res, next, val) => {
//   console.log(`id is ${val}`);
//   if (req.params.id * 1 > tours.length)
//     return res.status(404).json({ status: 'failed', message: 'Invalid Id' });
//   next();
// };

//no longer needed as middleware as mongoose will take care of check
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price)
//     return res
//       .status(400)
//       .json({ status: 'fail', message: 'Missing name or price' });
//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    // requestedAt: req.requestTime,
    data: { tours },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //+ convert to number
  // console.log(req.requestTime);
  // const id = +req.params.id;
  // const tour = tours.find((tour) => tour.id === id);
  // if (!tour)
  //   return res.status(404).json({ status: 'fail', message: 'invalid id' });
  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError('No tour found with that id', 404));
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
  // try {
  //   const newTour = await Tour.create(req.body);
  //   res.status(201).json({
  //     status: 'success',
  //     data: { tour: newTour },
  //   });
  // } catch (err) {
  //   res.status(400).json({ status: 'failed', message: err });
  // }
});
exports.updateTour = catchAsync(async (req, res, next) => {
  //The third argument specifies that the return data is the updated document.
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError('No tour found with that id', 404));
  res.status(200).json({ status: 'success', data: { tour } });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  //In restful api, it is a common practise not to send anything back
  //to client in a delete operation.
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError('No tour found with that id', 404));
  res.status(204).json({ status: 'success', data: null });
});

exports.getToursStat = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // use new name of avgPrice after it has gone through the pipeline
    { $match: { _id: { $ne: 'EASY' } } },
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    // fields with 0 will not be shown
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({ status: 'success', data: plan });
});
