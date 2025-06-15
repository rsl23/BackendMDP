import Joi from "joi";

// Schema untuk validasi start chat
export const startChatSchema = Joi.object({
  receiver_id: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Receiver ID is required",
      "any.required": "Receiver ID is required",
    }),
  message: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      "string.empty": "Message is required",
      "string.min": "Message cannot be empty",
      "string.max": "Message cannot exceed 1000 characters",
      "any.required": "Message is required",
    }),
});

// Schema untuk validasi update message status
export const updateMessageStatusSchema = Joi.object({
  status: Joi.string()
    .valid("delivered", "read")
    .required()
    .messages({
      "any.only": "Status must be either 'delivered' or 'read'",
      "any.required": "Status is required",
    }),
});

// Schema untuk validasi pagination query parameters
export const chatPaginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      "number.base": "Page must be a number",
      "number.integer": "Page must be an integer",
      "number.min": "Page must be at least 1",
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
});
