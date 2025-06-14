import express from "express";
import { updateProfile,forgotPassword,loginUser,registerUser,logout,getUserProfile,updatePassword } from '../controllers/authControllers.js';
const router = express.Router();
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

export default router;