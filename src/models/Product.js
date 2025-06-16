import { firestore } from "../config/database.js";
import User from "./User.js";
import { v4 as uuidv4 } from "uuid";

class Product {  
  constructor({
    product_id = null,
    name,
    price,
    description,
    category = "",
    image = "",
    user_id = null,
    created_at,
    deleted_at = null,
  }) {
    this.product_id = product_id;
    this.name = name;
    this.price = price;
    this.description = description;
    this.category = category;
    this.image = image;
    this.user_id = user_id;
    this.created_at = created_at || new Date().toISOString();
    this.deleted_at = deleted_at;
  }

  static get productsRef() {
    return firestore.collection("products");
  }

  static async create(product) {
    if (!product.name || !product.price) {
      throw new Error("Name, price are required.");
    }
    const newProduct = new Product(product);
    try {
      //Buat ngubah format ID produk jd PD001, PD002, dst
      // const snapshot = await Product.productsRef.get();
      // const count = snapshot.size + 1;
      // newProduct.product_id = `PD${String(count).padStart(3, "0")}`;

      //Random ID
      const newRef = Product.productsRef.doc();
      newProduct.product_id = newRef.id;
    } catch (error) {
      console.error("Error generating new product ID:", error);
      throw error;
    }
    try {
      console.log("Creating product with data:", {
        product_id: newProduct.product_id,
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        category: newProduct.category,
        image: newProduct.image,
        user_id: newProduct.user_id,
        created_at: newProduct.created_at,
        deleted_at: newProduct.deleted_at,
      });
      await Product.productsRef.doc(newProduct.product_id).set({
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        category: newProduct.category,
        image: newProduct.image,
        user_id: newProduct.user_id,
        created_at: newProduct.created_at,
        deleted_at: newProduct.deleted_at,
      });

      console.log(
        "User successfully created in Firestore with ID:",
        newProduct.product_id
      );
      return newProduct;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      throw error;
    }
  }
  static async findProductById(product_id) {
    try {
      const doc = await Product.productsRef.doc(product_id).get();
      if (doc.exists) {
        const productData = doc.data();
        if (productData.deleted_at) {
          return null;
        }
        return new Product({ product_id: doc.id, ...productData });
      }
      return null;
    } catch (error) {
      console.error("Error finding product by ID:", error);
      throw error;
    }
  }
  static async findProductByName(name) {
    try {
      const snapshot = await firestore
        .collection("products")
        .where("deleted_at", "==", null)
        .get();

      const matchedProducts = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name.toLowerCase().includes(name.toLowerCase())) {
          matchedProducts.push(
            new Product({ product_id: doc.id, ...data })
          );
        }
      });

      return matchedProducts;
    } catch (error) {
      console.error("Error finding products by name:", error);
      throw error;
    }
  }
  static async update(productId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    delete dataToUpdate.product_id;
    delete dataToUpdate.created_at;

    try {
      await Product.productsRef.doc(productId).update(dataToUpdate);
      return await Product.findProductById(productId);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }

  static async softDelete(productId) {
    try {
      await Product.productsRef.doc(productId).update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error soft deleting product:", error);
      throw error;
    }
  }
  static async getAllProducts(page, limit) {
    try {
      // Simplified query to avoid composite index requirement
      // Get all non-deleted products first, then handle pagination in memory
      const snapshot = await Product.productsRef
        .where("deleted_at", "==", null)
        .get();

      // Convert to array and sort by created_at descending
      const allProducts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        allProducts.push(new Product({ 
          product_id: doc.id, 
          ...data 
        }));
      });

      // Sort by created_at descending (newest first)
      allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Apply pagination in memory
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = allProducts.slice(startIndex, endIndex);

      const totalProducts = allProducts.length;

      return {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts,
          hasNext: page * limit < totalProducts,
          hasPrev: page > 1,
          limit,
        },
      };
    } catch (error) {
      console.error("Error getting all products:", error);
      throw error;
    }
  }

  toJSON() {
    const { ...productData } = this;
    return productData;
  }
}

export default Product;
