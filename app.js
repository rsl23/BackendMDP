import express from "express";
import dotenv from "dotenv";
import { db } from "./src/config/database.js";
dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(express.json());

app.get("/db-status", (req, res) => {
  if (db) {
    res.send(
      "Firebase Admin SDK has been initialized. Database object is available."
    );
  } else {
    res
      .status(500)
      .send(
        "Firebase Admin SDK initialization failed or db object is not available."
      );
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  if (db) {
    console.log("Firebase connection seems to be configured.");
  } else {
    console.warn("Firebase connection might not be configured properly.");
  }
});

export default app;