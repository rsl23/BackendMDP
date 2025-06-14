import express from "express";

import { 
  signup, 
  login, 
  logout,
  getUserProfile,
  requestPasswordReset,
  resetPassword
} from "../controllers/userController.js";

import {
  addProduct,
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
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

// =================== Product routes ===================
router.post("/add-product", addProduct);
router.get("/product/:product_id", findProductById);
router.get("/product/search/:name", findProductByName);

// =================== Transaction routes ===================
router.post("/create-transaction", createTransaction);

export default router;
