import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
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

        const alreadyExists = user.wishlist.some((id) => id.toString() === productId);

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist",
            });
        }

        user.wishlist.push(new mongoose.Types.ObjectId(productId));
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist",
        });
    }
};

// GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist,
        });
    } catch (error) {
        console.error("Get wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
        });
    }
};

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!isValidObjectId(productId)) {
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

        const exists = user.wishlist.some((id) => id.toString() === productId);

        if (!exists) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your wishlist",
            });
        }

        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist",
        });
    }
};