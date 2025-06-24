const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ isError: true, message: error.details[0].message });
    }
    next();
  };
}

module.exports = validate; 