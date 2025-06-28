import Product from "../models/Product.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";
import { productSchema, productupdateSchema } from "../utils/validation/productSchema.js";
import fs from 'fs';
import path from 'path';
import supabase from '../config/supabase.js';

// --- START: FIX for __dirname in ES Modules (ESSENTIAL for Multer's path handling) ---
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- END: FIX for __dirname in ES Modules ---

export const addProduct = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;
    console.log(`[addProduct] User authenticated: ${req.user.email} (${userId})`); // Added log

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log(`[addProduct] User not found for ID: ${userId}`); // Added log
      return errorResponse(res, 404, "User not found");
    }

    // Validate request data
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      console.error("[addProduct] Validation error:", error.details[0].message); // Added log
      return errorResponse(res, 400, "Validation error", {
        error: error.details[0].message
      });
    }

    let imageUrl = null;
    if (req.file) {
      // FIX: Use the path provided directly by Multer.
      // Multer's diskStorage, once correctly configured with path.resolve(__dirname, ...)
      // will provide an absolute and valid path here.
      const filePath = req.file.path;
      const originalname = req.file.originalname; // Use original name for Supabase

      console.log(`[addProduct] Attempting to upload file from local path: ${filePath}`); // Added log
      console.log(`[addProduct] Original filename: ${originalname}, Mimetype: ${req.file.mimetype}`); // Added log

      const fileBuffer = fs.readFileSync(filePath); // This line should now work correctly
      const fileName = `product/${Date.now()}_${originalname}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
        });

      // FIX: Use asynchronous fs.unlink for non-blocking file deletion
      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn(`[addProduct] Failed to delete local temp file ${filePath}:`, err);
        } else {
          console.log(`[addProduct] Successfully deleted local temp file: ${filePath}`);
        }
      });

      if (uploadError) {
        console.error("[addProduct] Supabase Upload Error:", uploadError.message); // Added log
        return errorResponse(res, 500, 'Upload gambar gagal', { error: uploadError.message });
      }

      imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
      console.log("[addProduct] Image successfully uploaded to Supabase:", imageUrl); // Added log
    } else {
      console.log("[addProduct] No image file provided in the request."); // Added log for clarity
      // You might add an error here if an image is mandatory for a product
      // return errorResponse(res, 400, "Image is required for product.");
    }

    // Prepare product data with user ID
    const productData = {
      ...value, // Use validated data
      user_id: userId,
      image: imageUrl
    };

    console.log("[addProduct] Creating product in database with data:", productData); // Added log

    // Create product in database
    const newProduct = await Product.create(productData);

    console.log("[addProduct] Product created successfully:", newProduct.id); // Added log
    return successResponse(res, 201, "Product added successfully", {
      product: newProduct
    });
  } catch (err) {
    console.error("[addProduct] Error adding product:", err); // Specific log for addProduct
    return errorResponse(res, 500, "Failed to add product", {
      error: err.message
    });
  }
};

// --- START: Original code (NOT CHANGED) ---

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
  const userId = req.user.id;

  if (!product_id) {
    return errorResponse(res, 400, "Product ID is required.");
  }

  try {
    // Check if product exists
    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    // Check if user is the owner of the product
    if (existingProduct.user_id !== userId) {
      return errorResponse(res, 403, "You don't have permission to update this product.");
    }

    // Validate request data
    const { error, value } = productupdateSchema.validate(req.body);
    if (error) {
      return errorResponse(res, 400, "Validation error", { 
        error: error.details[0].message 
      });
    }

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = `product/${Date.now()}_${req.file.originalname}`;

      const { data, error: uploadError } = await supabase.storage
        .from('images') 
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
        });

      fs.unlinkSync(filePath); // Hapus file lokal

      if (uploadError) {
        return errorResponse(res, 500, 'Upload gambar gagal', { error: uploadError.message });
      }

      const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
      value.image = imageUrl; 
        if (existingProduct.image) {
    const oldPath = existingProduct.image.split("/storage/v1/object/public/images/")[1];

        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([oldPath]);

          if (deleteError) {
            console.warn("Gagal menghapus gambar lama:", deleteError.message);
          }
        }
      }
    }
    
    // Update product
    const updatedProduct = await Product.update(product_id, value);

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
  const userId = req.user.userId;

  if (!product_id) {
    return errorResponse(res, 400, "Product ID is required.");
  }

  try {
    // Check if product exists and not already deleted
    const existingProduct = await Product.findProductById(product_id);
    if (!existingProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    // Check if user is the owner of the product
    if (existingProduct.user_id !== userId) {
      return errorResponse(res, 403, "You don't have permission to delete this product.");
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