import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import emailService from "../services/emailService.js";
import dotenv from "dotenv";
import { 
  signupSchema, 
  resetPasswordSchema, 
  requestPasswordResetSchema,
  loginSchema,
  changePasswordSchema 
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
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { username, email, password, address, phone_number, role } = value;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
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

    res.status(201).json({
      message: "User created successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Server error during signup.", error: error.message });
  }
};

export const login = async (req, res) => {
  // Validate input using Joi
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { email, password } = value;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials. Password incorrect." });
    }

    // Generate a token
    const tokenPayload = { id: user.id, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    // Update the access token in the database
    await User.updateAccessToken(user.id, token);
    const userResponse = user.toJSON(); // Use toJSON to exclude password

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
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
      res.status(200).json({
        message: "Logged out successfully. Token invalidated server-side.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res
        .status(500)
        .json({ message: "Server error during logout.", error: error.message });
    }
  } else {
    res
      .status(200)
      .json({ message: "Logged out successfully. Client should clear token." });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user?.id; // Get user ID from authenticated request

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userResponse = user.toJSON(); // Use toJSON to exclude password
    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching user profile.", error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  // Validate input using Joi
  const { error, value } = requestPasswordResetSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { email } = value;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal whether user exists or not for security
      return res.status(200).json({ 
        message: "If an account with that email exists, we have sent a password reset link." 
      });
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
      return res.status(500).json({ 
        message: "Error sending reset email. Please try again later." 
      });
    }

    res.status(200).json({ 
      message: "If an account with that email exists, we have sent a password reset link.",
      // In development, you might want to return the token for testing
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error("Error in password reset request:", error);
    res.status(500).json({ 
      message: "Server error during password reset request.", 
      error: error.message 
    });
  }
};

export const resetPassword = async (req, res) => {
  // Validate input using Joi
  const { error, value } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { token, newPassword } = value;

  try {
    // Find user by reset token
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token." 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await User.updatePassword(user.id, hashedPassword);

    // Send confirmation email
    await emailService.sendPasswordResetConfirmation(user.email, user.username);

    res.status(200).json({ 
      message: "Password has been reset successfully." 
    });

  } catch (error) {
    console.error("Error in password reset:", error);
    res.status(500).json({ 
      message: "Server error during password reset.", 
      error: error.message 
    });
  }
};

