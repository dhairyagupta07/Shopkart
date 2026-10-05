import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const normalizeCart = (user) => {
    if (!user || !Array.isArray(user.cart)) {
        return [];
    }

    return user.cart.map((item) => ({
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
    }));
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const user = await Customer.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingItem = user.cart.find((item) =>
            item.product.toString() === productId
        );

        if (existingItem) {
            const nextQuantity = existingItem.quantity + 1;

            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} unit(s) available in stock`,
                });
            }

            existingItem.quantity = nextQuantity;
        } else {
            user.cart.push({
                product: new mongoose.Types.ObjectId(productId),
                quantity: 1,
            });
        }

        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category",
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: normalizeCart(updatedUser),
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart",
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            cart: user.cart.map((item) => ({
                _id: item._id,
                product: item.product,
                quantity: item.quantity,
            })),
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        const user = await Customer.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const cartItem = user.cart.find((item) =>
            item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} unit(s) available in stock`,
            });
        }

        cartItem.quantity = quantity;
        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category",
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedUser.cart.map((item) => ({
                _id: item._id,
                product: item.product,
                quantity: item.quantity,
            })),
        });
    } catch (error) {
        console.error("Update cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart item",
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const user = await Customer.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingItem = user.cart.find((item) =>
            item.product.toString() === productId
        );

        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        user.cart = user.cart.filter((item) => item.product.toString() !== productId);
        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category",
        });

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart: updatedUser.cart.map((item) => ({
                _id: item._id,
                product: item.product,
                quantity: item.quantity,
            })),
        });
    } catch (error) {
        console.error("Remove from cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
        });
    }
};
