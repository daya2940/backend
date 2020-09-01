const express = require('express');
const router = express.Router();
const {authMiddleware,requireSignin,adminMiddleware} = require('../controllers/auth');

const {create,list,read,remove,update,listAllBlogsCategoriesTag} = require('../controllers/blog');

router.post('/blog',requireSignin,authMiddleware, create);
router.get('/blogs',list);
// router.post('/blogs-categories-tags',listAllBlogsCategoriesTag);
// router.get('/blogs/:slug',read);
// router.delete('/blogs/:slug',requireSignin,adminMiddleware,remove);
// router.put('/blogs/:slug',requireSignin,adminMiddleware,update);






module.exports = router;