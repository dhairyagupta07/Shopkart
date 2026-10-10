import express from "express";

import isAuthenticated from "../middlewares/auth.middleware.js";
import {
    createPaymentOrder,
    getOrderById,
    getOrders,
    verifyPayment,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create-payment-order", isAuthenticated, createPaymentOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);

export default router;
