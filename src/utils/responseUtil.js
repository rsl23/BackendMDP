/**
 * Standardized API Response Utility
 * Provides consistent response format across all controllers
 */

/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {string} message - Response message
 * @param {any} data - Response data (optional)
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    status: statusCode,
    message: message,
    data: data
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (400, 401, 404, 500, etc.)
 * @param {string} message - Error message
 * @param {any} errors - Additional error details (optional)
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    status: statusCode,
    message: message,
    data: errors
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Create a response object with standard format
 * Helper when you need to manually construct a response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @returns {Object} Formatted response object
 */
export const createResponseObject = (statusCode, message, data = null) => {
  return {
    status: statusCode,
    message: message,
    data: data
  };
};
