const Tag  = require('../models/tag');
// slugify  helps to fetch word like saurav-kumar which otherwise is not possible
const slugify = require('slugify');
const {errorHandler} = require('../helpers/DbHandlers');

exports.create = (req,res) =>{
  const {name} = req.body;
  let slug = slugify(name).toLowerCase();

  let tag = new Tag({name,slug});

  tag.save((err,data) => {
      if(err){
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(data);
  });
}

exports.list = (req,res) => {
  Tag.find({}).exec((err,data) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      return res.json(data);
  })
}

exports.read = (req,res) => {
  const slug = req.params.slug.toLowerCase();
  Tag.findOne({slug}).exec((err,category) => {
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
  Tag.findOneAndRemove({slug}).exec((err,category) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      return res.json({
        message: 'tag deleted successfully'
      });
  })
}