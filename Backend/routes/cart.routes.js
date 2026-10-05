import express from "express";

import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
} from "../controllers/cart.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:productId", isAuthenticated, addToCart);
router.get("/", isAuthenticated, getCart);
router.patch("/:productId", isAuthenticated, updateCartItem);
router.delete("/:productId", isAuthenticated, removeFromCart);

export default router;
