import Joi from "joi";

export const createTransactionSchema = Joi.object({
  product_id: Joi.string().required().messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required'
  }),
  total_price: Joi.number().min(0).required().messages({
    'number.base': 'Total price must be a number',
    'number.min': 'Total price must be at least 0',
    'any.required': 'Total price is required'
  }),
//   seller_id: Joi.string().required().messages({
//     'string.empty': 'Seller ID is required',
//     'any.required': 'Seller ID is required'
//   })
});

export const updateTransactionStatusSchema = Joi.object({
  payment_status: Joi.string().valid('pending', 'completed', 'cancelled', 'refunded').required().messages({
    'string.empty': 'Payment status is required',
    'any.only': 'Payment status must be one of: pending, completed, cancelled, refunded',
    'any.required': 'Payment status is required'
  }),
  payment_description: Joi.string().optional().allow('').messages({
    'string.base': 'Payment description must be a string'
  })
});
