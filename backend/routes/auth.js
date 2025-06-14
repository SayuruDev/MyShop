import express from "express";
import { forgotPassword,loginUser,registerUser,logout,getUserProfile } from '../controllers/authControllers.js';
const router = express.Router();
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/me").get(isAuthenticatedUser, getUserProfile);

export default router;