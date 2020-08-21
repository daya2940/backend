const User = require('../models/user');

exports.read = (req,res) => {
  req.profie.hashed_password = undefined;
  return res.json(req.profile);
}