const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModels');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection is successfull');
  });
//Load data into db
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded into DB');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
//Delete all data from db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
