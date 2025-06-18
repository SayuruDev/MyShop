import express from "express";
const router = express.Router();

import {authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {updateOrder,allOrders,myOrders,newOrder,getOrderDetails} from "../controllers/orderControllers.js";
router.route("/orders/new").post(isAuthenticatedUser, newOrder);
router.route("/orders/:id").get(isAuthenticatedUser, getOrderDetails);
router.route("/me/orders").get(isAuthenticatedUser, myOrders);
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allOrders);

router
  .route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)

export default router;