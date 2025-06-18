import express from "express";
import upload from '../middleware/uploadImage.js';

import { 
  signup, 
  login, 
  logout,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  getUserById,           
  // getUsers,              
  searchUsers            
} from "../controllers/userController.js";
import {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  findProductById,
  findProductByName,
} from "../controllers/productController.js";

import { 
  createTransaction, 
  getMyTransactions, 
  getTransactionById, 
  updateTransactionStatus 
} from "../controllers/transactionController.js";

import ChatController from "../controllers/chatController.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ============================== USER ROUTES =======================
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.get("/me-profile", authenticateToken, getUserProfile);
router.put("/me-profile", authenticateToken, updateUserProfile);         // Route untuk update profile pribadi
router.post("/change-password", authenticateToken, changePassword);      // Route untuk change password
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/user/:userId", authenticateToken, getUserById);                 // Route untuk get profile user lain
// router.get("/users", authenticateToken, getUsers);                          // Route untuk get all users (admin only)
router.get("/search-users", authenticateToken, searchUsers);                // Route untuk search users

// =================== Product routes ===================
router.get("/products", getAllProducts);                           // Route untuk get all products
router.post("/add-product",authenticateToken, upload.single('image'),addProduct);        // Route untuk add product (requires authentication)
router.get("/product/:product_id", findProductById);
router.put("/product/:product_id", authenticateToken, upload.single("image"),updateProduct);                 // Route untuk update product
router.delete("/product/:product_id", authenticateToken, deleteProduct);              // Route untuk delete product (soft delete)
router.get("/product/search/:name", findProductByName);

// =================== Transaction routes ===================
router.post("/create-transaction", authenticateToken, createTransaction);
router.get("/my-transactions", authenticateToken, getMyTransactions);
router.get("/transaction/:id", authenticateToken, getTransactionById);
router.put("/transaction/:id/status", authenticateToken, updateTransactionStatus);

// =================== Chat routes ===================
router.post("/chat", authenticateToken, ChatController.startChat);
router.get("/chat/conversations", authenticateToken, ChatController.getUserConversations);
router.get("/chat/conversation/:user_id", authenticateToken, ChatController.getConversation);
router.put("/chat/:chat_id/status", authenticateToken, ChatController.updateMessageStatus);
router.delete("/chat/:chat_id", authenticateToken, ChatController.deleteMessage);

export default router;
