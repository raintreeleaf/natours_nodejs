const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have 40 or less characters!'],
      minLength: [10, 'A tour name must have 10 or more characters!'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters!'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a group must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Choose between easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be 1 and above'],
      max: [5, 'Rating must be 5 and below'],
      // The above is a short hand for
      // max: {values: [5], message: 'Rating must be 5 and below'}],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'a tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discournt price ({VALUE})should be below regular price',
        //({VALUE})syntax for mongoose only
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'a tour must have a description'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      require: [true, 'a tour must have a cover image'],
    },
    images: [String],
    createAt: { type: Date, default: Date.now(), select: false },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
  },
  { toJSON: { virtuals: true }, toobject: { virtuals: true } },
);
//select: false will not return the field "select" when queried
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
//query will not work for virtual properties since it is not in database
//DOCUMENT MIDDLEWARE: runs before .save(), .create(), but not .insertmany()
tourSchema.pre('save', function (next) {
  //this refers to the currently processed document
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', function (next) {
//   console.log('will save document');
//   next();
// });
// tourSchema.post('save', function (docs, next) {
//   console.log(doc);
//   next();
// });
//QUERY MIDDLEWARE
//'find' middleware does not work for findOne, findById(behind the scene implements findOne)
// tourSchema.pre('find', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(docs);
  console.log('Time in milliseconds = ', Date.now() - this.start);
  next();
});
//Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this);
  next();
});
const tour = mongoose.model('tour', tourSchema);
module.exports = tour;
