const {check} = require('express-validator');


exports.userSignupValidator = [
  check('name')
    .not()
    .isEmpty()
    .withMessage('Name is required'),
  check('email')
    .isEmail()
    .withMessage('Email is required'),
  check('password')
    .isLength({min:6})
    .withMessage('password must be six character in length')
];

exports.userSigninValidator = [
  check('email')
    .isEmail()
    .withMessage('Email is required'),
  check('password')
    .isLength({min:6})
    .withMessage('password must be six character in length')
];