const Joi = require('joi');

const schemas = {
  auth: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required()
  }),
  order: Joi.object({
    customer_id: Joi.string().hex().length(24).required(),
    sku_id: Joi.string().hex().length(24).required(),
    quantity: Joi.number().min(1).max(1000).required(),
    rate: Joi.number().min(0.01).required()
  }),
  customer: Joi.object({
    name: Joi.string().min(3).max(30).required(), // Fixed field name from username to name
    address: Joi.string().min(3).max(100).required()
  }),
  sku: Joi.object({
    sku_name: Joi.string().min(3).max(50).required(),
    unit_of_measurement: Joi.string().valid('pcs', 'kg', 'liters').required(),
    tax_rate: Joi.number().min(0).max(100).required()
  })
};

module.exports = (schemaName) => {
  return (req, res, next) => {
    // Skip validation for GET requests
    if (req.method === 'GET') {
      return next();
    }
    
    const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.context.key,
          message: d.message.replace(/"/g, "'")
        }))
      });
    }
    
    next();
  };
};
