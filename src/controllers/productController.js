import Product from "../models/Product.js";

export const addProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await Product.create(productData);
    return res.status(201).json({
      status: 201,
      product: newProduct,
      message: "Berhasil add Product",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const findProductById = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await Product.findProductById(product_id);

    return res.status(200).json({ status: 200, product: product });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
};

export const findProductByName = async (req, res) => {
  const { name } = req.params;
  try {
    const product = await Product.findProductByName(name);
    return res.status(200).json({ status: 200, product: product });
  } catch (err) {
    return res.status(500).json({ status: 500, error: err.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validasi parameter pagination
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        status: 400,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100.",
      });
    }

    const result = await Product.getAllProducts(pageNum, limitNum);

    return res.status(200).json({
      status: 200,
      message: "Products retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while fetching products.",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({
      status: 400,
      message: "Product ID is required.",
    });
  }

  try {
    // Check if product exists
    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
      });
    }

    // Update product
    const updatedProduct = await Product.update(product_id, req.body);

    if (!updatedProduct) {
      return res.status(404).json({
        status: 404,
        message: "Failed to update product.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while updating product.",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { product_id } = req.params;

  if (!product_id) {
    return res.status(400).json({
      status: 400,
      message: "Product ID is required.",
    });
  }

  try {
    // Check if product exists and not already deleted
    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return res.status(404).json({
        status: 404,
        message: "Product not found.",
      });
    }

    // Soft delete product
    const deleteResult = await Product.softDelete(product_id);

    if (!deleteResult) {
      return res.status(500).json({
        status: 500,
        message: "Failed to delete product.",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error while deleting product.",
      error: error.message,
    });
  }
};
