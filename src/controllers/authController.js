import admin from "firebase-admin";
import express from "express";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/responseUtil.js";
import fs from 'fs';
import path from 'path';
import supabase from '../config/supabase.js';

const app = express();
app.use(express.json());

/**
 * Verifikasi token Firebase dan mencari atau membuat user di Firestore
 * Mendukung login dengan email/password atau Google
 */
export const verifyFirebaseToken = async (req, res) => {
  const token = req.body.token;
  console.log("Received token:", req.body.token);
  if (!token) {
    return errorResponse(res, 400, "ID token is required");
  }

  try {
    // 1. Verifikasi token dengan Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // 2. Ambil data lengkap user dari Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    
    // 3. Cek apakah user sudah ada di Firestore
    let user = await User.findByFirebaseUid(uid);
    
    // Default profile image
    const DEFAULT_PROFILE = "https://xfjgljpmqadlkhrikuxa.supabase.co/storage/v1/object/public/images/profile/userNoIcon.png";
    
    // 4. Jika belum ada, buat user baru di Firestore
    if (!user) {
      console.log(`Creating new user in Firestore for: ${userRecord.email}`);
      
      // Tentukan provider dan profile picture
      const authProvider = userRecord.providerData[0].providerId || "password";
      
      // Jika Google login, ambil foto dari Google. Jika tidak, gunakan default
      const profilePicture = 
        (authProvider === "google.com" && userRecord.photoURL) 
          ? userRecord.photoURL 
          : DEFAULT_PROFILE;
      
      // Buat user baru di Firestore
      user = await User.create({
        email: userRecord.email,
        username: userRecord.displayName || userRecord.email.split('@')[0],
        firebase_uid: uid,
        profile_picture: profilePicture,
        auth_provider: authProvider,
        // password: null // Tidak perlu password untuk auth Firebase
      });
      
      console.log(`New user created with ID: ${user.id}`);
    } else {
      console.log(`User found in Firestore: ${user.id}`);
      
      // Jika sudah ada user, update profile picture jika perlu
      // Untuk Google login, prioritaskan gambar Google jika user belum upload custom
      if (userRecord.providerData[0].providerId === "google.com" && 
          userRecord.photoURL && 
          (user.profile_picture === DEFAULT_PROFILE || !user.profile_picture)) {
        
        await User.update(user.id, { 
          profile_picture: userRecord.photoURL 
        });
        
        // Refresh user data
        user = await User.findById(user.id);
      }
    }

    return successResponse(res, 200, "Authentication successful", {
      user: user.toJSON()
    });
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    
    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 401, "Token expired", "Please login again");
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return errorResponse(res, 401, "Token revoked", "Please login again");
    }
    
    return errorResponse(res, 401, "Invalid token", error.message);
  }
};

// Keep the existing function for backward compatibility
// export const verifyGoogleLogin = async (req, res) => {
//   const { idToken } = req.body;

//   try {
//     const decodedToken = await admin.auth().verifyIdToken(idToken);
//     const uid = decodedToken.uid;

//     const userRecord = await admin.auth().getUser(uid);

//     return successResponse(res, 200, "Google login successful", {
//       uid,
//       email: userRecord.email,
//       name: userRecord.displayName,
//     });
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     return errorResponse(res, 401, "Invalid ID token", error.message);
//   }
// };

/**
 * Update foto profil user
 * Mendukung integrasi dengan Supabase dan Firebase
 */
export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Check if file is provided
    if (!req.file) {
      return errorResponse(res, 400, "No image file provided");
    }

    // Upload to Supabase
    const filePath = path.resolve(req.file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `profile/${Date.now()}_${req.file.originalname}`;

    const { data, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, fileBuffer, {
        contentType: req.file.mimetype,
      });

    // Delete local file
    fs.unlinkSync(filePath);

    if (uploadError) {
      return errorResponse(res, 500, "Upload failed", { error: uploadError.message });
    }

    // Generate image URL
    const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
    
    // Delete old profile picture if it exists and is not the default
    const DEFAULT_PROFILE = "https://xfjgljpmqadlkhrikuxa.supabase.co/storage/v1/object/public/images/profile/userNoIcon.png";
    if (user.profile_picture && user.profile_picture !== DEFAULT_PROFILE) {
      try {
        // Extract the path part after /images/
        const oldPath = user.profile_picture.split("/images/")[1];
        if (oldPath) {
          await supabase.storage.from("images").remove([oldPath]);
        }
      } catch (deleteError) {
        console.warn("Failed to delete old profile picture:", deleteError);
      }
    }

    // Update user profile in Firestore
    await User.update(userId, { profile_picture: imageUrl });

    // If user has Firebase user, also update photoURL there
    if (user.firebase_uid) {
      try {
        await admin.auth().updateUser(user.firebase_uid, {
          photoURL: imageUrl
        });
      } catch (firebaseError) {
        console.warn("Failed to update Firebase user photo:", firebaseError);
        // Continue anyway, Firestore is our source of truth
      }
    }

    return successResponse(res, 200, "Profile picture updated successfully", {
      profile_picture: imageUrl
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return errorResponse(res, 500, "Failed to update profile picture", {
      error: error.message
    });
  }
};
