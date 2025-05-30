const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Name is required",
  }),
  price: Joi.number()
    .required()
    .messages({ "any.required": "Price is required" }),
  description: Joi.string().allow(""),
  image: Joi.string().uri().allow("").messages({
    "string.uri": "Image must be a valid URL",
  }),
  //   user: Joi.object({
  //     id: Joi.string().required().messages({
  //       "string.empty": "User ID is required",
  //     }),
  //     username: Joi.string().required().messages({
  //       "string.empty": "Username is required",
  //     }),
  //   })
  //     .required()
  //     .messages({
  //       "any.required": "User is required",
  //       "object.base": "User must be a valid object",
  //     }),
});
