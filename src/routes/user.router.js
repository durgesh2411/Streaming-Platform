import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logOutUser } from "../controllers/user.controller.js";
const router = Router();

// Registration with mandatory file uploads
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImages", maxCount: 5 },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

// secured routes:
router.route("/logout").post(verifyJWT, logOutUser);   // middleware can be added here with the methods to be performed before executing the controller logic

export default router;
