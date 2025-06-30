import { firestore } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";
import User from "./User.js";
import Product from "./Product.js";

class Transaction {
  constructor({
    transaction_id,
    user_seller,
    email_buyer,
    product,
    datetime,
    payment_id,
    payment_status,
    payment_description,

    // === Tambahan Midtrans ===
    midtrans_order_id,
    snap_token,
    redirect_url,
    payment_type,
    va_number,
    pdf_url,
    settlement_time,
    expiry_time
  }) {
    this.transaction_id = transaction_id;
    this.user_seller = user_seller; // seller user object/id
    this.email_buyer = email_buyer; // buyer email
    this.product = product; // product object/id
    this.datetime = datetime || new Date().toISOString();
    this.payment_id = payment_id;
    this.payment_status = payment_status || "pending";
    this.payment_description = payment_description;

    // === Midtrans
    this.midtrans_order_id = midtrans_order_id;
    this.snap_token = snap_token;
    this.redirect_url = redirect_url;
    this.payment_type = payment_type;
    this.va_number = va_number;
    this.pdf_url = pdf_url;
    this.settlement_time = settlement_time;
    this.expiry_time = expiry_time;
  }

  static get transactionRef() {
    return firestore.collection("transactions");
  }

  static async fetchAll() {
    try {
      const snapshot = await Transaction.transactionRef.get();
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          transaction_id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }

  static async createTransaction(transactionData) {
    const {
      seller_id,
      buyer_email,
      product_id,
      quantity,
      total_price,
      payment_description = null
    } = transactionData;

    if (!seller_id || !buyer_email || !product_id || !quantity || !total_price) {
      throw new Error("Required fields missing: seller_id, buyer_email, product_id, quantity, total_price");
    }

    try {
      // Generate transaction ID
      const transactionCount = (await Transaction.fetchAll()).length;
      // const transaction_id = `TR${(transactionCount + 1).toString().padStart(3, "0")}`;
      const transaction_id = `TR${uuidv4().split('-')[0].toUpperCase()}`; // Use UUID for unique transaction ID
      
      // Generate payment ID
      const payment_id = `PAY${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Verify seller exists and get seller data
      const seller = await User.findById(seller_id);
      if (!seller) {
        throw new Error("Seller not found");
      }

      // Get product data
      const product = await Product.findProductById(product_id);
      if (!product) {
        throw new Error("Product not found");
      }

      // Prepare user_seller object (seller information)
      const user_seller = {
        id: seller.id,
        username: seller.username,
        email: seller.email,
        phone_number: seller.phone_number || null
      };      // Prepare product object with transaction details
      const productData = {
        id: product.product_id,         // Fix: product.product_id bukan product.id
        name: product.name,
        price: product.price,
        description: product.description || null,
        image_url: product.image || null,    // Fix: product.image bukan product.image_url
        category: product.category || null,
        quantity: quantity,
        total_price: total_price
      };      const newTransactionData = {
        transaction_id,
        user_seller,
        email_buyer: buyer_email,
        product: productData,
        datetime: new Date().toISOString(),
        payment_id,
        payment_status: "pending",
        payment_description: payment_description || `Payment for ${product.name} (${quantity}x)`
      };

      // Debug log untuk melihat data sebelum disimpan
      console.log("=== TRANSACTION DATA DEBUG ===");
      console.log("Transaction ID:", transaction_id);
      console.log("Product data:", productData);
      console.log("User seller:", user_seller);
      console.log("Email buyer:", buyer_email);
      
      // Validate no undefined values
      if (!productData.id) {
        throw new Error("Product ID is undefined");
      }
      if (!user_seller.id) {
        throw new Error("Seller ID is undefined");
      }
      if (!buyer_email) {
        throw new Error("Buyer email is undefined");
      }

      // Save to Firestore
      await Transaction.transactionRef.doc(transaction_id).set(newTransactionData);

      return newTransactionData;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw new Error("Failed to create transaction: " + error.message);
    }
  }

  static async findById(transaction_id) {
    try {
      const doc = await Transaction.transactionRef.doc(transaction_id).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          transaction_id: doc.id,
          ...data
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error finding transaction by ID:", error);
      throw new Error("Failed to find transaction");
    }
  }

  static async findByUserSeller(seller_id) {
    try {
      const snapshot = await Transaction.transactionRef
        .where("user_seller.id", "==", seller_id)
        .get();
      
      const transactions = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          transaction_id: doc.id,
          ...data,
          user_role: 'seller'
        });
      });
      
      // Sort by datetime descending (newest first)
      transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      
      return transactions;
    } catch (error) {
      console.error("Error finding transactions by seller:", error);
      throw new Error("Failed to find seller transactions");
    }
  }

  static async findByEmailBuyer(buyer_email) {
    try {
      const snapshot = await Transaction.transactionRef
        .where("email_buyer", "==", buyer_email)
        .get();
      
      const transactions = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          transaction_id: doc.id,
          ...data,
          user_role: 'buyer'
        });
      });
      
      // Sort by datetime descending (newest first)
      transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      
      return transactions;
    } catch (error) {
      console.error("Error finding transactions by buyer email:", error);
      throw new Error("Failed to find buyer transactions");
    }
  }

  static async findByUser(user_id, user_email, role = 'both') {
    try {
      let transactions = [];
      
      if (role === 'seller' || role === 'both') {
        const sellerTransactions = await Transaction.findByUserSeller(user_id);
        transactions = [...transactions, ...sellerTransactions];
      }
      
      if (role === 'buyer' || role === 'both') {
        const buyerTransactions = await Transaction.findByEmailBuyer(user_email);
        transactions = [...transactions, ...buyerTransactions];
      }
      
      // Remove duplicates and sort by datetime
      const uniqueTransactions = transactions.filter((transaction, index, self) =>
        index === self.findIndex(t => t.transaction_id === transaction.transaction_id)
      );
      
      uniqueTransactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      
      return uniqueTransactions;
    } catch (error) {
      console.error("Error finding transactions by user:", error);
      throw new Error("Failed to find user transactions");
    }
  }

  static async updateStatus(transaction_id, payment_status, payment_description = null) {
    try {
      const docRef = Transaction.transactionRef.doc(transaction_id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error("Transaction not found");
      }
      
      const updateData = {
        payment_status: payment_status,
        updated_at: new Date().toISOString()
      };
      
      if (payment_description) {
        updateData.payment_description = payment_description;
      }
      
      await docRef.update(updateData);
      
      // Return updated transaction
      const updatedDoc = await docRef.get();
      const data = updatedDoc.data();

// Ubah struktur product.id → product.product_id
      if (data.product && data.product.id) {
        data.product.product_id = data.product.id;
        delete data.product.id;
      }

      return {
        transaction_id: updatedDoc.id,
        ...data
      };
    } catch (error) {
      console.error("Error updating transaction status:", error);
      throw new Error("Failed to update transaction status: " + error.message);
    }
  }

  static async updatePaymentId(transaction_id, payment_id) {
    try {
      const docRef = Transaction.transactionRef.doc(transaction_id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        throw new Error("Transaction not found");
      }
      
      await docRef.update({
        payment_id: payment_id,
        updated_at: new Date().toISOString()
      });
      
      // Return updated transaction
      const updatedDoc = await docRef.get();
      return {
        transaction_id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error("Error updating payment ID:", error);
      throw new Error("Failed to update payment ID: " + error.message);
    }
  }

  //untuk midtrans
  static async updateMidtransData(transaction_id, midtransData) {
  try {
    const docRef = Transaction.transactionRef.doc(transaction_id);

    const updateFields = {
      midtrans_order_id: midtransData.order_id,
      snap_token: midtransData.token,
      redirect_url: midtransData.redirect_url,
      payment_type: midtransData.payment_type? midtransData.payment_type : null,
      va_number: midtransData.va_numbers?.[0]?.va_number || null,
      pdf_url: midtransData.pdf_url || null,
      expiry_time: midtransData.expiry_time || null
    };

    await docRef.update(updateFields);

    const updatedDoc = await docRef.get();
    return {
      transaction_id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Error updating Midtrans data:", error);
    throw new Error("Failed to update Midtrans data: " + error.message);
  }
}

}

export default Transaction;
