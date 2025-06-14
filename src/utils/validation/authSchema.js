import Joi from 'joi';

// Password validation schema
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least: 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character (@$!%*?&)',
    'any.required': 'Password is required'
  });

// Email validation schema
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

// Username validation schema
const usernameSchema = Joi.string()
  .min(3)
  .max(50)
  .pattern(new RegExp('^[a-zA-Z0-9_-]+$'))
  .required()
  .messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username cannot exceed 50 characters',
    'string.pattern.base': 'Username can only contain letters, numbers, hyphens, and underscores',
    'any.required': 'Username is required'
  });

// Signup schema
export const signupSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema, // Use strict password validation
  address: Joi.string().max(255).allow('').optional(),
  phone_number: Joi.string()
    .pattern(new RegExp('^[+]?[0-9\\s-()]{10,15}$'))
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
  role: Joi.string().valid('user', 'admin').default('user').optional()
});

// Login schema
export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Request password reset schema
export const requestPasswordResetSchema = Joi.object({
  email: emailSchema
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: passwordSchema.messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.max': 'New password cannot exceed 128 characters',
    'string.pattern.base': 'New password must contain at least: 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character (@$!%*?&)',
    'any.required': 'New password is required'
  })
});

// Change password schema (for authenticated users)
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: passwordSchema.messages({
    'string.min': 'New password must be at least 8 characters long',
    'string.max': 'New password cannot exceed 128 characters',
    'string.pattern.base': 'New password must contain at least: 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character (@$!%*?&)',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match',
      'any.required': 'Password confirmation is required'
    })
});

// Profile update schema
export const updateProfileSchema = Joi.object({
  username: usernameSchema.optional(),
  address: Joi.string().max(255).allow('').optional(),
  phone_number: Joi.string()
    .pattern(new RegExp('^[+]?[0-9\\s-()]{10,15}$'))
    .allow('')
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

// Google login schema
export const googleLoginSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required'
  })
});