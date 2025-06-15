import express from "express";
const router = express.Router();

import { isAuthenticatedUser } from "../middlewares/auth.js";
import {newOrder} from "../controllers/orderControllers.js";
router.route("/orders/new").post(isAuthenticatedUser, newOrder);

export default router;