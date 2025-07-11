import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
const router = Router();

// Registration with mandatory file uploads
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImages", maxCount: 5 },
  ]),
  registerUser,
);

export default router;
