import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ErrorMiddleware } from "./middlewares/error.middleware.js";

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routers
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";

// Use routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);

// // 404 Route Not Found handler
// app.use("*", (req, res, next) => {
//   next(new ApiError(404, `Route ${req.originalUrl} not found`));
// });

// Global error handler middleware
app.use(ErrorMiddleware);

export default app;
