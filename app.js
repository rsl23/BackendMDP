import express from "express";
import dotenv from "dotenv";
import { firestore } from "./src/config/database.js";
dotenv.config();
import router from "./src/routes/Routes.js";

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/db-status", (req, res) => {
  if (firestore) {
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
console.log("Initializing Express app...");

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  if (firestore) {
    console.log("Firebase connection seems to be configured.");
  } else {
    console.warn("Firebase connection might not be configured properly.");
  }
});

export default app;
