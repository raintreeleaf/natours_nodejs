const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();
// router.param('id', tourController.checkId);
const {
  getAllTours,
  getTour,
  updateTour,
  deleteTour,
  createTour,
  getToursStat,
} = tourController;
router.route('/tours-stat').get(getToursStat);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/top-5-cheap').get(tourController.aliasTopTours, getAllTours);
router.route('/').get(authController.protect, getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
