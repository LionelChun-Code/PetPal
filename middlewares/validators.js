const { body } = require('express-validator');


const checkSignup = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match!');
    }
    return true;
  }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

const checkSignin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
];

const checkUpdatePassword = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

const checkUpdateProfile = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('username').notEmpty().withMessage('Username cannot be empty')
];

module.exports = { checkSignup, checkSignin, checkUpdatePassword, checkUpdateProfile };
