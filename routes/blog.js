const express = require('express');
const router = express.Router();
const {authMiddleware,requireSignin,adminMiddleware} = require('../controllers/auth');

const {create,list,read,remove,update,listAllBlogCategoriesTags,photo} = require('../controllers/blog');

router.post('/blog',requireSignin,authMiddleware, create);
router.get('/blogs',list);
router.post('/blogs-categories-tags',listAllBlogCategoriesTags);
router.get('/blogs/:slug',read);
router.delete('/blogs/:slug',requireSignin,adminMiddleware,remove);
router.put('/blog/:slug',requireSignin,adminMiddleware,update);
router.get('/blog/photo/:slug',photo)


module.exports = router;