import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: SECRET_KEY is not defined in .env file.");
  process.exit(1);
}

// export const signup = async (req, res) => {
//   const { username, email, password, address, phone_number, role } = req.body;

//   if (!username || !email || !password) {
//     return res
//       .status(400)
//       .json({ message: "Username, email, and password are required." });
//   }

//   try {
//     const existingUser = await User.findByEmail(email);
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User already exists with this email." });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await User.create({
//       username,
//       email,
//       password: hashedPassword, // Pass the hashed password to the model
//       address,
//       phone_number,
//       role, // Role will default to 'user' if not provided, as per model
//     });

//     // Generate a token
//     const tokenPayload = { id: newUser.id, role: newUser.role };
//     const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

//     // Optionally, save the token to the user model if you store session tokens there
//     await User.updateAccessToken(newUser.id, token);
//     const userResponse = newUser.toJSON(); // Use toJSON to exclude password

//     res.status(201).json({
//       message: "User created successfully",
//       token,
//       user: userResponse,
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res
//       .status(500)
//       .json({ message: "Server error during signup.", error: error.message });
//   }
// };

export const signup = async (req, res) => {
  try {
    const user = User.create(req.body);
    if (!user) {
      return res.status(400).json({ message: "User creation failed." });
    } else {
      return res.status(200).json({ message: "User Berhasil Signup" });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Server error during signup.", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

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
