import Transaction from "../models/Transaction.js";

export const createTransaction = async (req, res) => {
  const { seller_id, buyer_id, product_id, quantity, total_price } = req.body;
  if (!seller_id || !buyer_id || !product_id || !quantity || !total_price) {
    return res
      .status(400)
      .json({ status: 400, message: "All fields are required." });
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
      return res.status(201).json({
        status: 201,
        transaction: newTransaction,
        message: "Transaction created successfully.",
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
      return res
        .status(500)
        .json({ status: 500, message: "Failed to create transaction." });
    }
  }
};
