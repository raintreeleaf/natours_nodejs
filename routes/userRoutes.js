const express = require('express');

const router = express.Router();
const usercontroller = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.param('id', (req, res, next, val) => {
  console.log(`user id is ${val}`);
  next();
});
router.route('/').get(usercontroller.getAllUsers);
router
  .route('/:id')
  .get(usercontroller.getUser)
  .patch(usercontroller.updateUser)
  .delete(usercontroller.deleteUser);

module.exports = router;
