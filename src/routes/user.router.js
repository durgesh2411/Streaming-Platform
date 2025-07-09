import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const router = Router();
// this /register will get added to the /user in the url.
router.route("/register").post(registerUser);
export default router;
