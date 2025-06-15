import admin from "firebase-admin";
import express from "express";
import { successResponse, errorResponse } from "../utils/responseUtil.js";

const app = express();
app.use(express.json());

export const verifyGoogleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRecord = await admin.auth().getUser(uid);

    return successResponse(res, 200, "Google login successful", {
      uid,
      email: userRecord.email,
      name: userRecord.displayName,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return errorResponse(res, 401, "Invalid ID token", error.message);
  }
};
