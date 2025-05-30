import { firestore } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
import User from "./User.js";

import Product from "./Product.js";

class Transaction {
  constructor({
    user_id,
    product_id,
    quantity,
    datetime,
    total_price,
    payment_status,
  }) {
    this.user_id = user_id;
    this.product_id = product_id;
    this.quantity = quantity;
    this.payment_status = payment_status || "pending";
    this.datetime = new Date().toISOString();
    this.total_price = total_price || 0;
  }

  static get transactionRef() {
    return firestore.collection("transaction");
  }

  static async fetchAll() {
    const snapshot = await Transaction.transactionRef.get();
    if (snapshot.empty) {
      return [];
    } else {
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return new Transaction({
          transaction_id: doc.id,
          user_id: data.user_id,
          product_id: data.product_id,
          quantity: data.quantity,
          created_at: data.created_at,
        });
      });
    }
  }

  static async create(transactionData) {
    if (
      !transactionData.seller_id ||
      !transactionData.product_id ||
      !transactionData.quantity ||
      !transactionData.buyer_id ||
      !transactionData.datetime ||
      !transactionData.payment_status
    ) {
      throw new Error("No Empty Fields.");
    } else {
      const id =
        `TR` +
        ((await Transaction.fetchAll()).length + 1).toString().padStart(3, "0");
      const newTransaction = new Transaction({
        transaction_id: id,
        ...transactionData,
      });
      try {
        const user = await User.usersRef.doc(newTransaction.user_id).get();
        if (!user.exists) {
          throw new Error("User not found");
        }
        const product = await Product.productsRef
          .doc(newTransaction.product_id)
          .get();
        if (!product.exists) {
          throw new Error("Product not found");
        }

        await Transaction.transactionRef
          .doc(newTransaction.transaction_id)
          .set({
            buyer_id: newTransaction.buyer_id,
            seller_id: newTransaction.seller_id,
            product_id: newTransaction.product_id,
            quantity: newTransaction.quantity,
            total_price: newTransaction.total_price,
            datetime: newTransaction.datetime,
            payment_status: newTransaction.payment_status,
          });

        return newTransaction;
      } catch (err) {
        console.error("Error creating transaction:", err);
        throw new Error("Failed to create transaction.");
      }
    }
  }

  static async findById(transaction_id) {
    const doc = await Transaction.transactionRef.doc(transaction_id).get();
    if (doc.exists) {
      const data = doc.data();
      return new Transaction({
        transaction_id: doc.id,
        user_id: data.user_id,
        product_id: data.product_id,
        quantity: data.quantity,
        created_at: data.created_at,
      });
    } else {
      throw new Error("Transaction not found.");
    }
  }

  static async findByUserID(user_id) {
    const doc = await Transaction.transactionRef
      .where("user_id", "==", user_id)
      .get();
    if (doc.empty) {
      throw new Error("No transactions found for this user.");
    } else {
      const transactions = [];
      doc.forEach((transaction) => {
        const data = transaction.data();
        transactions.push(
          new Transaction({
            transaction_id: transaction.id,
            user_id: data.user_id,
            product_id: data.product_id,
            quantity: data.quantity,
            created_at: data.created_at,
          })
        );
      });
    }
  }
}
