import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailService from "../services/emailService.js";
import dotenv from "dotenv";
import { successResponse, errorResponse } from "../utils/responseUtil.js";
import { 
  signupSchema, 
  resetPasswordSchema, 
  requestPasswordResetSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema 
} from "../utils/validation/authSchema.js";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: SECRET_KEY is not defined in .env file.");
  process.exit(1);
}

export const signup = async (req, res) => {
  // Validate input using Joi
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { username, email, password, address, phone_number, role } = value;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 400, "User already exists with this email.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword, // Pass the hashed password to the model
      address,
      phone_number,
      role, // Role will default to 'user' if not provided, as per model
    });

    // Generate a token
    const tokenPayload = { id: newUser.id, role: newUser.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    // Optionally, save the token to the user model if you store session tokens there
    await User.updateAccessToken(newUser.id, token);
    const userResponse = newUser.toJSON(); // Use toJSON to exclude password

    return successResponse(res, 201, "User created successfully", {
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse(res, 500, "Server error during signup.", error.message);
  }
};

export const login = async (req, res) => {
  // Validate input using Joi
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { email, password } = value;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, 400, "Invalid credentials. User not found.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, 400, "Invalid credentials. Password incorrect.");
    }

    // Generate a token
    const tokenPayload = { id: user.id, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "24h" });

    // Update the access token in the database
    await User.updateAccessToken(user.id, token);
    const userResponse = user.toJSON(); // Use toJSON to exclude password

    return successResponse(res, 200, "Logged in successfully", {
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Server error during login.", error.message);
  }
};

export const logout = async (req, res) => {
  // For a truly stateful logout where tokens are invalidated server-side,
  // you'd typically need a token blocklist or similar mechanism.
  // If you store the access_token in the User model, you can clear it.

  const userId = req.user?.id; // Get user ID from authenticated request (e.g., from a JWT middleware)

  if (userId) {
    try {
      await User.updateAccessToken(userId, null); // Clear the access token in the database
      return successResponse(res, 200, "Logged out successfully. Token invalidated server-side.");
    } catch (error) {
      console.error("Logout error:", error);
      return errorResponse(res, 500, "Server error during logout.", error.message);
    }
  } else {
    return successResponse(res, 200, "Logged out successfully. Client should clear token.");
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user?.id; // Get user ID from authenticated request

  if (!userId) {
    return errorResponse(res, 401, "Unauthorized access.");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const userResponse = user.toJSON(); // Use toJSON to exclude password
    return successResponse(res, 200, "User profile retrieved successfully", { user: userResponse });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return errorResponse(res, 500, "Server error while fetching user profile.", error.message);
  }
};

export const requestPasswordReset = async (req, res) => {
  // Validate input using Joi
  const { error, value } = requestPasswordResetSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { email } = value;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not for security
      return successResponse(res, 200, "If an account with that email exists, we have sent a password reset link.");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // Save reset token to database
    await User.setResetPasswordToken(user.id, resetToken, resetTokenExpires);

    // Send reset email
    const emailResult = await emailService.sendResetPasswordEmail(
      user.email, 
      user.username, 
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return errorResponse(res, 500, "Error sending reset email. Please try again later.");
    }

    const responseData = process.env.NODE_ENV === 'development' ? { resetToken } : null;
    return successResponse(
      res, 
      200, 
      "If an account with that email exists, we have sent a password reset link.",
      responseData
    );

  } catch (error) {
    console.error("Error in password reset request:", error);
    return errorResponse(res, 500, "Server error during password reset request.", error.message);
  }
};

export const resetPassword = async (req, res) => {
  // Validate input using Joi
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { token, newPassword } = value;

  try {
    // Find user by reset token
    const user = await User.findByResetToken(token);
    if (!user) {
      return errorResponse(res, 400, "Invalid or expired reset token.");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await User.updatePassword(user.id, hashedPassword);

    // Send confirmation email
    await emailService.sendPasswordResetConfirmation(user.email, user.username);

    return successResponse(res, 200, "Password has been reset successfully.");

  } catch (error) {
    console.error("Error in password reset:", error);
    return errorResponse(res, 500, "Server error during password reset.", error.message);
  }
};

// Endpoint baru untuk mengambil profile user lain berdasarkan ID
export const getUserById = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user?.id; // User yang melakukan request

  if (!userId) {
    return errorResponse(res, 400, "User ID is required.");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    // Check if user is deleted/soft deleted
    if (user.deleted_at) {
      return errorResponse(res, 404, "User not found.");
    }

    // Create public profile (exclude sensitive information)
    const publicProfile = {
      id: user.id,
      username: user.username,
      email: user.email, // Bisa di-hide jika mau lebih private
      profile_picture: user.profile_picture,
      auth_provider: user.auth_provider,
      created_at: user.created_at,
      // Exclude sensitive data: password, access_token, reset_password_token, dll
    };

    // Optional: Add extra info if viewing own profile
    if (requesterId === userId) {
      publicProfile.phone_number = user.phone_number;
      publicProfile.address = user.address;
      publicProfile.role = user.role;
    }

    return successResponse(res, 200, "User profile retrieved successfully", { 
      user: publicProfile,
      isOwnProfile: requesterId === userId
    });

  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return errorResponse(res, 500, "Server error while fetching user profile.", error.message);
  }
};

// Endpoint untuk mengambil daftar semua users (Admin only)
// export const getUsers = async (req, res) => {
//   const requesterId = req.user?.id;
//   const requesterRole = req.user?.role;
  
//   // Hanya admin yang bisa akses endpoint ini
//   if (requesterRole !== 'admin') {
//     return res.status(403).json({ message: "Access denied. Admin only." });
//   }

//   try {
//     const { page = 1, limit = 10, search = '' } = req.query;
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const offset = (pageNum - 1) * limitNum;

//     // Get users from database menggunakan method yang sudah dibuat
//     const result = await User.getAllUsers(pageNum, limitNum, search);

//     res.status(200).json(result);

//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ 
//       message: "Server error while fetching users.", 
//       error: error.message 
//     });
//   }
// };

// Endpoint untuk search users berdasarkan username atau email
export const searchUsers = async (req, res) => {
  const requesterId = req.user?.id;
  const { query } = req.query;

  if (!query || query.trim().length < 2) {
    return errorResponse(res, 400, "Search query must be at least 2 characters long.");
  }

  try {
    const searchResults = await User.searchUsers(query.trim(), 10);

    return successResponse(res, 200, "Users search completed", {
      users: searchResults,
      query: query,
      count: searchResults.length
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return errorResponse(res, 500, "Server error while searching users.", error.message);
  }
};

// Endpoint untuk update profile pribadi user
export const updateUserProfile = async (req, res) => {
  const userId = req.user?.id; // Get user ID from authenticated request

  if (!userId) {
    return errorResponse(res, 401, "Unauthorized access.");
  }

  // Validate input using Joi
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  try {
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return errorResponse(res, 404, "User not found.");
    }

    // Update profile
    const updatedUser = await User.updateProfile(userId, value);
    
    if (!updatedUser) {
      return errorResponse(res, 404, "Failed to update profile.");
    }

    const userResponse = updatedUser.toJSON(); // Exclude sensitive information
    
    return successResponse(res, 200, "Profile updated successfully", {
      user: userResponse
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    
    // Handle specific error cases
    if (error.message === "Username already taken by another user.") {
      return errorResponse(res, 409, "Username is already taken", error.message);
    }
    
    return errorResponse(res, 500, "Server error while updating profile.", error.message);
  }
};

// Endpoint untuk change password (berbeda dari reset password)
export const changePassword = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return errorResponse(res, 401, "Unauthorized access.");
  }

  // Validate input using Joi
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    return errorResponse(res, 400, "Validation error", validationErrors);
  }

  const { currentPassword, newPassword } = value;

  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return errorResponse(res, 400, "Current password is incorrect.");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.updatePassword(userId, hashedNewPassword);

    // Send confirmation email
    await emailService.sendPasswordChangeConfirmation(user.email, user.username);

    return successResponse(res, 200, "Password changed successfully.");

  } catch (error) {
    console.error("Error changing password:", error);
    return errorResponse(res, 500, "Server error while changing password.", error.message);
  }
};

export const getUserByFirebaseUid = async (req, res) => {
  try {
    const { firebase_uid } = req.params;
    
    // Validasi firebase_uid
    if (!firebase_uid || firebase_uid.trim() === '') {
      return errorResponse(res, 400, 'Firebase UID is required', 
        'Firebase UID parameter is missing or empty');
    }

    // Cari user berdasarkan Firebase UID
    const user = await User.findByFirebaseUid(firebase_uid);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found', 
        `No user found with Firebase UID: ${firebase_uid}`);
    }

    // Return public profile (jangan expose sensitive data)
    const publicProfile = user.toPublicProfile();
    
    return successResponse(res, 200, 'User found successfully', {
      publicProfile
    });

  } catch (error) {
    console.error('Error in getUserByFirebaseUid:', error);
    return errorResponse(res, 500, 'Internal server error', 
      'An error occurred while fetching user data');
  }
};