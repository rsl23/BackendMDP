import Product from "../models/Product.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";

export const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await Product.create(productData);
    return successResponse(res, 201, "Berhasil add Product", {
      product: newProduct
    });
  } catch (err) {
    return errorResponse(res, 500, "Failed to add product", {
      error: err.message
    });
  }
};

export const findProductById = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await Product.findProductById(product_id);
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }
    return successResponse(res, 200, "Product found", { product });
  } catch (err) {
    return errorResponse(res, 500, "Failed to fetch product", { error: err.message });
  }
};

export const findProductByName = async (req, res) => {
  const { name } = req.params;
  try {
    const product = await Product.findProductByName(name);
    return successResponse(res, 200, "Products found", { product });
  } catch (err) {
    return errorResponse(res, 500, "Failed to search products", { error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validasi parameter pagination
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return errorResponse(res, 400, "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100.");
    }

    const result = await Product.getAllProducts(pageNum, limitNum);    return successResponse(res, 200, "Products retrieved successfully", result);
  } catch (error) {
    console.error("Error fetching all products:", error);
    return errorResponse(res, 500, "Server error while fetching products", {
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  const { product_id } = req.params;

  if (!product_id) {
    return errorResponse(res, 400, "Product ID is required.");
  }

  try {
    // Check if product exists    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    // Update product
    const updatedProduct = await Product.update(product_id, req.body);

    if (!updatedProduct) {
      return errorResponse(res, 404, "Failed to update product.");
    }

    return successResponse(res, 200, "Product updated successfully", {
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse(res, 500, "Server error while updating product", {
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { product_id } = req.params;

  if (!product_id) {
    return errorResponse(res, 400, "Product ID is required.");
  }

  try {    // Check if product exists and not already deleted
    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    // Soft delete product
    const deleteResult = await Product.softDelete(product_id);

    if (!deleteResult) {
      return errorResponse(res, 500, "Failed to delete product.");
    }

    return successResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse(res, 500, "Server error while deleting product", {
      error: error.message
    });
  }
};
