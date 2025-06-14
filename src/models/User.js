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
    reset_password_token = null, //
    reset_password_expires = null, // 
    google_uid = null,              // Google User ID untuk Google Login
    profile_picture = null,         // URL profile picture dari Google
    auth_provider = "local",        // Provider authentication: "local", "google", atau "both"
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
    this.reset_password_token = reset_password_token; //
    this.reset_password_expires = reset_password_expires; //
    // PERUBAHAN 2: Assign field baru untuk Google Login
    this.google_uid = google_uid;
    this.profile_picture = profile_picture;
    this.auth_provider = auth_provider;
    this.created_at = created_at || new Date().toISOString();
    this.deleted_at = deleted_at;
  }

  static get usersRef() {
    return firestore.collection("users");
  }
  static async create(userData) {
    // Update validasi untuk support Google users
    if (!userData.email || !userData.username) {
      throw new Error("Email and username are required.");
    }
    
    // Password wajib untuk local users, optional untuk Google users
    if (userData.auth_provider === "local" && !userData.password) {
      throw new Error("Password is required for local users.");
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
    try {      // console.log("Creating user with data:", {
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
        // Menambahkan field Google Login ke database
        google_uid: newUser.google_uid,
        profile_picture: newUser.profile_picture,
        auth_provider: newUser.auth_provider,
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

  // Method baru untuk mencari user berdasarkan Google UID
  static async findByGoogleUid(googleUid) {
    try {
      const snapshot = await User.usersRef
        .where("google_uid", "==", googleUid)
        .where("deleted_at", "==", null)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return new User({ id: doc.id, ...doc.data() });
      }
      return null;
    } catch (error) {
      console.error("Error finding user by Google UID:", error);
      throw error;
    }
  }

  //Method untuk mengambil semua users dengan pagination
  // static async getAllUsers(page = 1, limit = 10, search = '') {
  //   try {
  //     const offset = (page - 1) * limit;
      
  //     // Base query untuk mencari user yang tidak di-delete
  //     let query = User.usersRef
  //       .where("deleted_at", "==", null)
  //       .orderBy("created_at", "desc");

  //     // Jika ada search term, filter berdasarkan username (basic implementation)
  //     if (search) {
  //       query = query
  //         .where("username", ">=", search)
  //         .where("username", "<=", search + '\uf8ff');
  //     }

  //     // Execute query dengan pagination
  //     const snapshot = await query
  //       .limit(limit)
  //       .offset(offset)
  //       .get();

  //     const users = [];
  //     snapshot.forEach(doc => {
  //       const userData = doc.data();
  //       // Return public profile data saja
  //       users.push({
  //         id: doc.id,
  //         username: userData.username,
  //         email: userData.email,
  //         profile_picture: userData.profile_picture,
  //         role: userData.role,
  //         auth_provider: userData.auth_provider,
  //         created_at: userData.created_at
  //       });
  //     });

  //     // Get total count untuk pagination info
  //     const totalSnapshot = await User.usersRef
  //       .where("deleted_at", "==", null)
  //       .get();
  //     const totalUsers = totalSnapshot.size;

  //     return {
  //       users,
  //       pagination: {
  //         currentPage: page,
  //         totalPages: Math.ceil(totalUsers / limit),
  //         totalUsers,
  //         hasNext: page * limit < totalUsers,
  //         hasPrev: page > 1
  //       }
  //     };
  //   } catch (error) {
  //     console.error("Error getting all users:", error);
  //     throw error;
  //   }
  // }

  // Method untuk search users berdasarkan username atau email
  static async searchUsers(searchTerm, limit = 10) {
    try {
      const searchLower = searchTerm.toLowerCase();
      
      // Search by username (case-insensitive)
      const usernameSnapshot = await User.usersRef
        .where("deleted_at", "==", null)
        .orderBy("username")
        .startAt(searchLower)
        .endAt(searchLower + '\uf8ff')
        .limit(limit)
        .get();

      const users = new Map(); // Use Map to avoid duplicates

      // Process username search results
      usernameSnapshot.forEach(doc => {
        const userData = doc.data();
        users.set(doc.id, {
          id: doc.id,
          username: userData.username,
          email: userData.email,
          profile_picture: userData.profile_picture,
          created_at: userData.created_at
        });
      });

      return Array.from(users.values());
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Method untuk update profile user
  static async updateProfile(userId, updateData) {
    const allowedFields = ['username', 'address', 'phone_number'];
    const dataToUpdate = {};
    
    // Filter hanya field yang diizinkan untuk diupdate
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        dataToUpdate[key] = updateData[key];
      }
    });

    // Tambahkan timestamp update
    dataToUpdate.updated_at = new Date().toISOString();

    try {
      // Cek apakah username sudah digunakan oleh user lain
      if (dataToUpdate.username) {
        const snapshot = await User.usersRef
          .where("username", "==", dataToUpdate.username)
          .where("deleted_at", "==", null)
          .get();

        if (!snapshot.empty) {
          const existingUser = snapshot.docs[0];
          if (existingUser.id !== userId) {
            throw new Error("Username already taken by another user.");
          }
        }
      }

      await User.usersRef.doc(userId).update(dataToUpdate);
      return await User.findById(userId);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  toJSON() {
    const { 
      password, 
      access_token, 
      reset_password_token, 
      reset_password_expires, 
      ...userData 
    } = this;
    return userData;
  }

  // untuk membuat public profile (untuk user lain)
  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email, // Bisa di-comment jika mau hide email
      profile_picture: this.profile_picture,
      created_at: this.created_at
      // Exclude: password, tokens, address, phone_number, role
    };
  }
}

export default User;
