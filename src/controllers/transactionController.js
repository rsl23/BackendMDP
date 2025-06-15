import Transaction from "../models/Transaction.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";

export const createTransaction = async (req, res) => {
  const { seller_id, buyer_id, product_id, quantity, total_price } = req.body;
  if (!seller_id || !buyer_id || !product_id || !quantity || !total_price) {
    return errorResponse(res, 400, "All fields are required.");
  } else {
    try {
      const newTransaction = await Transaction.createTransaction({
        seller_id: seller_id,
        product_id: product_id,
        quantity: quantity,
        total_price: total_price,
        buyer_id: buyer_id,
        datetime: new Date().toISOString(),
        payment_status: "pending",
      });
      return successResponse(res, 201, "Transaction created successfully", {
        transaction: newTransaction
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      return errorResponse(res, 500, "Failed to create transaction", {
        error: error.message
      });
    }
  }
};
