import express from "express";

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
  findProductById,
  findProductByName,
} from "../controllers/productController.js";

import { createTransaction } from "../controllers/transactionController.js";

import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// =================== User routes ===================
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
router.post("/add-product", addProduct);
router.get("/product/:product_id", findProductById);
router.get("/product/search/:name", findProductByName);

// =================== Transaction routes ===================
router.post("/create-transaction", createTransaction);

export default router;
