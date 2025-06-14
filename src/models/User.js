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
    reset_password_token = null,
    reset_password_expires = null,
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
    this.reset_password_token = reset_password_token;
    this.reset_password_expires = reset_password_expires;
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
      const snapshot = await User.usersRef.get();
      const count = snapshot.size + 1;
      newUser.id = `US${String(count).padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating new user ID:", error);
      throw error;
    }
    try {
      // console.log("Creating user with data:", {
      //   id: newUser.id,
      //   email: newUser.email,
      //   username: newUser.username,
      //   address: newUser.address,
      //   phone_number: newUser.phone_number,
      //   role: newUser.role,
      //   created_at: newUser.created_at,
      //   deleted_at: newUser.deleted_at,
      // });

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

      console.log(
        "User successfully created in Firestore with ID:",
        newUser.id
      );
      return newUser;
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const doc = await User.usersRef.doc(userId).get();
      if (doc.exists) {
        const userData = doc.data();
        if (userData.deleted_at) {
          return null;
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

  //buat nyimpan reset token
  static async setResetPasswordToken(userId, token, expiresAt) {
    try {
      await User.usersRef.doc(userId).update({
        reset_password_token: token,
        reset_password_expires: expiresAt,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error setting reset password token:", error);
      return false;
    }
  }

  //buat nyari user berdasarkan reset token
  static async findByResetToken(token) {
    try {
      const snapshot = await User.usersRef
        .where("reset_password_token", "==", token)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const userData = new User({ id: doc.id, ...doc.data() });

        // Check if token is still valid
        if (new Date() > new Date(userData.reset_password_expires)) {
          return null; // Token expired
        }

        return userData;
      }
      return null;
    } catch (error) {
      console.error("Error finding user by reset token:", error);
      throw error;
    }
  }

  //buat clear reset token setelah digunakan
  static async clearResetPasswordToken(userId) {
    try {
      await User.usersRef.doc(userId).update({
        reset_password_token: null,
        reset_password_expires: null,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error clearing reset password token:", error);
      return false;
    }
  }

  //buat update password
  static async updatePassword(userId, hashedPassword) {
    try {
      await User.usersRef.doc(userId).update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
        updated_at: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  toJSON() {
    const { password, ...userData } = this;
    return userData;
  }
}

export default User;
