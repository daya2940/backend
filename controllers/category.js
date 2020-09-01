const Category  = require('../models/category');
// slugify  helps to fetch word like saurav-kumar which otherwise is not possible
const slugify = require('slugify');
const {errorHandler} = require('../helpers/DbHandlers');

exports.create = (req,res) =>{
  const {name} = req.body;
  let slug = slugify(name).toLowerCase();

  let category = new Category({name,slug});

  category.save((err,data) => {
      if(err){
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(data);
  });
}

exports.list = (req,res) => {
  Category.find({}).exec((err,data) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      return res.json(data);
  });
};

exports.read = (req,res) => {
  const slug = req.params.slug.toLowerCase();
  Category.findOne({slug}).exec((err,category) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      return res.json(category);
  })
}

exports.remove = (req,res) => {
  const slug = req.params.slug.toLowerCase();
  Category.findOneAndRemove({slug}).exec((err,category) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      return res.json({
        message: 'category deleted successfully'
      });
  })
}