import express from "express";
import dotenv from "dotenv";
import { authenticate } from "./authMiddleware.js";
import { createProxy } from "./proxy.js";

dotenv.config();

const app = express();
app.use(express.json());

/**
 * Health check
 */
app.get("/health", (_, res) => {
  res.json({ status: "API Gateway running" });
});

/**
 * User App Routes
 */
app.use(
  "/restaurants",
  authenticate,
  createProxy(process.env.RESTAURANT_SERVICE_URL)
);

app.use(
  "/beverages",
  authenticate,
  createProxy(process.env.BEVERAGE_SERVICE_URL)
);

app.use("/events", authenticate, createProxy(process.env.EVENT_SERVICE_URL));

app.use("/users", authenticate, createProxy(process.env.USER_SERVICE_URL));

app.use("/bookmarks", authenticate, createProxy(process.env.USER_SERVICE_URL));

app.use("/diary", authenticate, createProxy(process.env.USER_SERVICE_URL));

app.use("/friends", authenticate, createProxy(process.env.SOCIAL_SERVICE_URL));

// ← ADD THIS ROUTE
app.use("/experts", authenticate, createProxy(process.env.EXPERT_SERVICE_URL));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
