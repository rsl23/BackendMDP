import { firestore } from "../config/database.js";
import User from "./User.js";
import { v4 as uuidv4 } from "uuid";

class Product {
  constructor({
    name,
    price,
    description,
    category = "",
    image = "",
    user_id = null,
    created_at,
    deleted_at = null,
  }) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.category = category;
    this.image = image;
    this.user_id = userId;
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
        return new Product({ id: doc.product_id, ...productData });
      }
      return null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
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
            new Product({ product_id: doc.product_id, ...data })
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
      return await Product.findById(productId);
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

  toJSON() {
    const { ...productData } = this;
    return productData;
  }
}

export default Product;
