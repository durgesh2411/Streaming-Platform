import express from "express";
import cors from "cors";

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
// Import routes
import userRoutes from "./routes/user.router.js";
//when we have /user req we  transfer control to userRoutes
// routes will add their part to this /user prefix use the controllers logic.
//i.e. https://example.com/user/register  - implemented logic from user controller
// this is done to keep the code modular , for login we dont have to write the same code again.
// i.e. https://example.com/user/login  - implemented logic from user controller(method is changed to login)
// use api//v1 : as api is created with version 1, so that we can change the api in future without breaking.
app.use("/api/v1/user", userRoutes);
export { app };
