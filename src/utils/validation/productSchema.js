import Joi from "joi";

const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  price: Joi.number()
    .required()
    .messages({ "any.required": "Price is required" }),
  description: Joi.string().allow(""),
  category: Joi.string().allow(""),
  // image: Joi.string().uri().allow("").messages({
  //   "string.uri": "Image must be a valid URL",
  // }),
});

const productupdateSchema = Joi.object({
  name: Joi.string().optional().messages({
    "string.empty": "Name is required",
  }),
  price: Joi.number()
    .optional()
    .messages({ "any.required": "Price is required" }),
  description: Joi.string().allow(""),
  category: Joi.string().allow(""),
  // image: Joi.string().uri().allow("").messages({
  //   "string.uri": "Image must be a valid URL",
  // }),
});

export {productSchema, productupdateSchema};
