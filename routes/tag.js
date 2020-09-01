const express = require('express');
const router = express.Router();

const {runValidation} = require('../validators');
const {CreateTagValidator} = require('../validators/tags');
const {adminMiddleware,requireSignin} = require('../controllers/auth');
const {create,list,remove,read} = require('../controllers/tag');

router.post('/tag',CreateTagValidator,runValidation,requireSignin,adminMiddleware,create);
router.get('/tags',list);
router.get('/tag/:slug',read);
router.delete('/tag/:slug',requireSignin,adminMiddleware,remove);

module.exports = router;
