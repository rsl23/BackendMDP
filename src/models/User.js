import { db } from "../config/database.js";
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
    return db.ref("users");
  }

  static async create(userData) {
    if (!userData.email || !userData.password || !userData.username) {
      throw new Error("Email, password, and username are required.");
    }
    const newUser = new User(userData);
    try {
      await User.usersRef.child(newUser.id).set({
        email: newUser.email,
        password: hashedPassword,
        username: newUser.username,
        address: newUser.address,
        phone_number: newUser.phone_number,
        role: newUser.role,
        // access_token is typically managed by auth, not directly set on creation this way
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
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
      const snapshot = await User.usersRef.child(userId).once("value");
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.deleted_at) {
          return null; // Or handle soft-deleted users differently
        }
        return new User({ id: userId, ...userData });
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
        .orderByChild("email")
        .equalTo(email)
        .once("value");
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        // orderByChild can return multiple matches if email is not unique (though it should be)
        // We'll take the first one that isn't soft-deleted.
        for (const userId in usersData) {
          if (
            usersData.hasOwnProperty(userId) &&
            !usersData[userId].deleted_at
          ) {
            return new User({ id: userId, ...usersData[userId] });
          }
        }
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
    // Prevent changing immutable fields or sensitive fields directly without proper checks
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;
    delete dataToUpdate.email; // Email usually shouldn't be changed this way
    delete dataToUpdate.role; // Role changes should be privileged

    try {
      await User.usersRef.child(userId).update(dataToUpdate);
      return await User.findById(userId);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // For updating access token specifically
  static async updateAccessToken(userId, accessToken) {
    try {
      await User.usersRef.child(userId).update({
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
      await User.usersRef.child(userId).update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        access_token: null, // Invalidate token on delete
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
