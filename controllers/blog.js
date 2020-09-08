const Blog = require('../models/blog');
const Category = require('../models/category');
const Tag = require('../models/tag');

const formidable = require('formidable');
const slugify = require('slugify');
const stripHtml = require('string-strip-html');
const _ = require('lodash'); // for updating our blog

const { errorHandler } = require('../helpers/DbHandlers');
const fs = require('fs');
const { smartTrim } = require('../helpers/blog');
const { response } = require('express');

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: 'Image could not upload'
      });
    }

    const { title, body, categories, tags } = fields;

    if (!title || title.length < 0) {
      return res.status(400).json({
        error: 'title is required'
      });
    }

    if (!body || body.length < 200) {
      return res.status(400).json({
        error: 'content is too short'
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: 'At least one category is required'
      });
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: 'At least one tag is required'
      });
    }

    let blog = new Blog();
    blog.title = title;
    blog.body = body;
    blog.excerpt = smartTrim(body, 320, ' ', ' ...');
    blog.slug = slugify(title).toLowerCase();
    blog.mtitle = `${title}-${process.env.APP_NAME}`;
    blog.mdesc = stripHtml(body.substring(0, 160));
    blog.postedBy = req.user.id;

    //categories and tags
    let arrayOfCategories = categories && categories.split(',');
    let arrayOfTags = tags && tags.split(',');

    // a method for uploading image using nodes js file system
    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          message: 'Image should be less than 1Mb in size'
        });
      }
      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;
      console.log('saved images to db');
    }
    blog.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      // return res.json(result);

      Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfCategories } }, { new: true }).exec((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }
        else {
          Blog.findByIdAndUpdate(result._id, { $push: { categories: arrayOfTags } }, { new: true }).exec((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err)
              });
            } else {
              res.json(result);
            }

          });

        }
      });
    });
  });
};

exports.list = (req, res) => {
  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((error, data) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(data);
    });
};

exports.listAllBlogCategoriesTags = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? req.body.skip : 0;

  let blogs;
  let categories;
  let tags;


  Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username profile')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    .exec((error, data) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error)
        });
      }


      blogs = data;

      Category.find({}).exec((err, c) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }
        categories = c;

        Tag.find({}).exec((err, t) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            });
          }
          tags = t;

          // rturn all categorise,blog and tags 
          res.json({ blogs, categories, tags, size: blogs.length });
        })
      });
    });
};


exports.read = (req, res) => {
  console.log(req.params.slug);
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug })
    // .select('-photo')
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug body categories tags mtitle mdesc postedBy createdAt updatedAt')
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(data);
    })
}

exports.remove = (req, res) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json({ message: 'Blog deleted Successfully' });
  });
}

exports.update = (req, res) => {
  console.log(req.params.slug);
  const slug = req.params.slug.toLowerCase();

  Blog.findOne({ slug }).exec((error, oldBlog) => {
    if (error) {
      return res.status(400).json({
        message: 'Image could not upload'
      });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          message: 'Image could not upload'
        });
      }

      // important step for seo as well as do not allow the slug to change because this will
      // lead to  incosistencies
      let slugBeforeMerge = oldBlog.slug;
      oldBlog = _.merge(oldBlog, fields);
      oldBlog.slug = slugBeforeMerge;

      const { body, desc, categories, tags } = fields;

      if (body) {
        oldBlog.excerpt = smartTrim(body, 320, '', '...');
        oldBlog.desc = stripHtml(body.substring(0, 160));
      }

      if (categories) {
        oldBlog.categories = categories.split(',');
      }

      if (tags) {
        oldBlog.tags = tags.split(',');
      }

      if (files.photo) {
        console.log(files.photo);
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            message: 'Image should be less than 1Mb in size'
          });
        }
        oldBlog.photo.data = fs.readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;
        console.log('saved images to db');
      }
      oldBlog.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err)
          });
        }
        result.photo = undefined;
        res.json(result);
      });
    });

  })

};

exports.photo = (req,res) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).select('photo').exec((error, blog) => {
    if (error || !blog) {
      return res.status(400).json({
        message:errorHandler(error)
      });
    }
    res.set('Content-Type',blog.photo.contentType);
    return res.send(blog.photo.data);
  })
}

