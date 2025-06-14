import admin from "firebase-admin";
import express from "express";

const app = express();
app.use(express.json());

export const verifyGoogleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await admin.auth().getUser(uid);

    res.status(200).json({
      message: "Google login successful",
      uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ message: "Invalid ID token", error: error.message });
  }
};
