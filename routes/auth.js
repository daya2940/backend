const express = require('express');
const router = express.Router();
const {signup,signin,signout} = require('../controllers/auth');

//validators
const {runValidation} = require('../validators');
const {userSignupValidator} = require('../validators/auth');
const {userSigninValidator} = require('../validators/auth');


router.post('/signup',runValidation,userSignupValidator,signup);
router.post('/signin',runValidation,userSigninValidator,signin);
router.get('/signout',signout);

module.exports = router;