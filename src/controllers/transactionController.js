import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";
import { createTransactionSchema, updateTransactionStatusSchema } from "../utils/validation/transactionSchema.js";

// POST /create-transaction - Create new transaction (requires authentication)
export const createTransaction = async (req, res) => {
  const buyer_id = req.user?.id;

  if (!buyer_id) {
    return errorResponse(res, 401, "Unauthorized access. Please login first.");
  }

  // Validate input using Joi
  const { error, value } = createTransactionSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }
  const { product_id, quantity, total_price } = value;
  console.log("=== CREATE TRANSACTION DEBUG ===");
  console.log("Request product_id:", product_id);
  console.log("Buyer ID from token:", buyer_id);
  
  try {
    const user = await User.findById(buyer_id);
    const buyer_email = user?.email;
    console.log("Buyer email:", buyer_email);
    
    // Get product and seller info
    const product = await Product.findProductById(product_id);
    console.log("Raw product from DB:", product);
    
    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }
    
    console.log("Product details:", {
      product_id: product.product_id,
      name: product.name,
      seller_id: product.user_id,
      price: product.price
    });
    
    const seller_id = product.user_id;
    if (!seller_id) {
      return errorResponse(res, 400, "Product does not have a seller.");
    }
    const seller = await User.findById(seller_id);
    if (!seller) {
      return errorResponse(res, 404, "Seller not found.");
    }
    if (buyer_id === seller_id) {
      return errorResponse(res, 400, "You cannot buy your own product.");
    }
    if (product.stock && product.stock < quantity) {
      return errorResponse(res, 400, "Insufficient product stock.");
    }    console.log("Transaction params:", {
      seller_id: seller.id,
      buyer_email: buyer_email, 
      product_id: product.product_id,
      quantity: quantity,
      total_price: total_price
    });
    

    // Prepare transaction data for new model
    const transactionData = {
      seller_id: seller.id,
      buyer_email: buyer_email,
      product_id: product.product_id,
      quantity,
      total_price
    };

    const newTransaction = await Transaction.createTransaction(transactionData);
    return successResponse(res, 201, "Transaction created successfully", {
      transaction: newTransaction
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return errorResponse(res, 500, "Failed to create transaction", error.message);
  }
};

// GET /my-transactions - Get user's transaction history (requires authentication)
export const getMyTransactions = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
    return errorResponse(res, 401, "Unauthorized access. Please login first.");
  }

  try {
    // Get user data from ID to get email
    const user = await User.findById(user_id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const user_email = user.email;
    const { role } = req.query; // Optional: 'buyer', 'seller', or 'both' (default)
    const filterRole = role && ['buyer', 'seller', 'both'].includes(role) ? role : 'both';

    console.log("Getting transactions for user:", user_id, "email:", user_email, "role:", filterRole);

    // Use the new model method with user_id and user_email
    const transactions = await Transaction.findByUser(user_id, user_email, filterRole);

    // Transactions are already enriched with product and user data from the model
    return successResponse(res, 200, "Transactions retrieved successfully", {
      transactions: transactions,
      count: transactions.length,
      filter: filterRole
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return errorResponse(res, 500, "Failed to fetch transactions", error.message);
  }
};

// GET /transaction/:id - Get transaction details (requires authentication)
export const getTransactionById = async (req, res) => {
  const user_id = req.user?.id;
  const { id } = req.params;

  if (!user_id) {
    return errorResponse(res, 401, "Unauthorized access. Please login first.");
  }

  if (!id) {
    return errorResponse(res, 400, "Transaction ID is required.");
  }

  try {
    // Get user data from ID to get email
    const user = await User.findById(user_id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const user_email = user.email;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found.");
    }

    console.log("Checking authorization - User ID:", user_id, "User Email:", user_email);
    console.log("Transaction seller ID:", transaction.user_seller?.id);
    console.log("Transaction buyer email:", transaction.email_buyer);

    // Check if user is authorized to view this transaction
    // User must be either the seller (user_seller.id) or buyer (email_buyer)
    const isAuthorized = 
      (transaction.user_seller && transaction.user_seller.id === user_id) ||
      (transaction.email_buyer === user_email);

    if (!isAuthorized) {
      return errorResponse(res, 403, "Access denied. You can only view your own transactions.");
    }

    // Determine user role
    const user_role = transaction.email_buyer === user_email ? 'buyer' : 'seller';

    // Transaction already contains all necessary data (user_seller, email_buyer, product)
    const enrichedTransaction = {
      ...transaction,
      user_role: user_role
    };

    return successResponse(res, 200, "Transaction details retrieved successfully", {
      transaction: enrichedTransaction
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return errorResponse(res, 500, "Failed to fetch transaction details", error.message);
  }
};

// PUT /transaction/:id/status - Update transaction status (requires authentication)
export const updateTransactionStatus = async (req, res) => {
  const user_id = req.user?.id;
  const { id } = req.params;

  if (!user_id) {
    return errorResponse(res, 401, "Unauthorized access. Please login first.");
  }

  if (!id) {
    return errorResponse(res, 400, "Transaction ID is required.");
  }

  // Validate input using Joi
  const { error, value } = updateTransactionStatusSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { payment_status } = value;

  try {
    // Get user data from ID to get email
    const user = await User.findById(user_id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const user_email = user.email;

    // Check if transaction exists
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return errorResponse(res, 404, "Transaction not found.");
    }

    console.log("Checking update authorization - User ID:", user_id, "User Email:", user_email);
    console.log("Transaction seller ID:", transaction.user_seller?.id);
    console.log("Transaction buyer email:", transaction.email_buyer);

    // Check if user is authorized to update this transaction
    const isSellerAuth = transaction.user_seller && transaction.user_seller.id === user_id;
    const isBuyerAuth = transaction.email_buyer === user_email;

    if (!isSellerAuth && !isBuyerAuth) {
      return errorResponse(res, 403, "Access denied. You can only update your own transactions.");
    }

    // Determine user role
    const userRole = isBuyerAuth ? 'buyer' : 'seller';
    console.log("User role determined as:", userRole);

    // Business logic for status updates
    if (userRole === 'buyer') {
      // Buyers can only cancel pending transactions
      if (payment_status !== 'cancelled') {
        return errorResponse(res, 403, "Buyers can only cancel transactions.");
      }
      if (transaction.payment_status !== 'pending') {
        return errorResponse(res, 400, "Only pending transactions can be cancelled.");
      }
    } else if (userRole === 'seller') {
      // Sellers can mark as completed or refunded
      if (!['completed', 'refunded'].includes(payment_status)) {
        return errorResponse(res, 403, "Sellers can only mark transactions as completed or refunded.");
      }
      if (payment_status === 'completed' && transaction.payment_status !== 'pending') {
        return errorResponse(res, 400, "Only pending transactions can be marked as completed.");
      }
    }

    // Update with optional description
    const { payment_description } = req.body;
    const updatedTransaction = await Transaction.updateStatus(id, payment_status, payment_description);

    return successResponse(res, 200, "Transaction status updated successfully", {
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return errorResponse(res, 500, "Failed to update transaction status", error.message);
  }
};
