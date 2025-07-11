import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credecials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// good practice to use body-parser middleware:
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from public directory
app.use("/uploads", express.static("public/temp"));

// Import routes
import userRoutes from "./routes/user.router.js";
//when we have /user req we  transfer control to userRoutes
// routes will add their part to this /user prefix use the controllers logic.
//i.e. https://example.com/user/register  - implemented logic from user controller
// this is done to keep the code modular , for login we dont have to write the same code again.
// i.e. https://example.com/user/login  - implemented logic from user controller(method is changed to login)
// use api//v1 : as api is created with version 1, so that we can change the api in future without breaking.
app.use("/api/v1/user", userRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  // Handle Multer errors
  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: `Unexpected field: ${error.field}. Expected fields: avatar, coverImages`,
    });
  }

  // Handle other multer errors
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`,
    });
  }

  // Handle API errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }

  // Handle other errors
  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export { app };
