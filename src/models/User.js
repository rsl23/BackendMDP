import { firestore } from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

class User {
  constructor({
    id,
    email,
    password,
    username,
    address = "",
    phone_number = "",
    role = "user",
    access_token = null,
    created_at,
    deleted_at = null,
  }) {
    this.id = id || uuidv4();
    this.email = email;
    this.password = password;
    this.username = username;
    this.address = address;
    this.phone_number = phone_number;
    this.role = role;
    this.access_token = access_token;
    this.created_at = created_at || new Date().toISOString();
    this.deleted_at = deleted_at;
  }

  static get usersRef() {
    return firestore.collection("users");
  }

  static async create(userData) {
    if (!userData.email || !userData.password || !userData.username) {
      throw new Error("Email, password, and username are required.");
    }
    const newUser = new User(userData);
    try {
      await User.usersRef.doc(newUser.id).set({
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
        address: newUser.address,
        phone_number: newUser.phone_number,
        role: newUser.role,
        created_at: newUser.created_at,
        updated_at: new Date().toISOString(),
        deleted_at: newUser.deleted_at,
      });
      return newUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const doc = await User.usersRef.doc(userId).get();
      if (doc.exists) {
        const userData = doc.data();
        if (userData.deleted_at) {
          return null; // Handle soft-deleted users
        }
        return new User({ id: doc.id, ...userData });
      }
      return null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const snapshot = await User.usersRef
        .where("email", "==", email)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return new User({ id: doc.id, ...doc.data() });
      }
      return null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async update(userId, updateData) {
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };
    // Prevent changing immutable fields or sensitive fields
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;
    delete dataToUpdate.email;
    delete dataToUpdate.role;

    try {
      await User.usersRef.doc(userId).update(dataToUpdate);
      return await User.findById(userId);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  static async updateAccessToken(userId, accessToken) {
    try {
      await User.usersRef.doc(userId).update({
        access_token: accessToken,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating access token:", error);
      return false;
    }
  }

  static async softDelete(userId) {
    try {
      await User.usersRef.doc(userId).update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        access_token: null,
      });
      return true;
    } catch (error) {
      console.error("Error soft deleting user:", error);
      throw error;
    }
  }

  toJSON() {
    const { password, ...userData } = this;
    return userData;
  }
}

export default User;
