import express from "express";
import { signup, login, logout } from "../controllers/userController.js";
import {
  addProduct,
  findProductById,
  findProductByName,
} from "../controllers/productController.js";

import { createTransaction } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/add-product", addProduct);
router.get("/product/:product_id", findProductById);
router.get("/product/search/:name", findProductByName);

router.post("/create-transaction", createTransaction);

export default router;
