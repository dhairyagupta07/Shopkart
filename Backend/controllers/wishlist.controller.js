import mongoose from "mongoose";
import User from "../models/customer.model.js";
import Product from "../models/product.model.js";


// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Check product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check duplicate
        const alreadyExists = req.user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // Add product reference
        req.user.wishlist.push(product._id);

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist"
        });
    }
};


// GET /wishlist
export const getWishlist = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .populate({
                path: "wishlist",
                select: "name price category image stock"
            });

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist"
        });
    }
};


// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = req.user.wishlist;

        const index = wishlist.findIndex(
            (id) => id.toString() === productId
        );

        // Product not in wishlist
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        // Remove product reference
        wishlist.splice(index, 1);

        await req.user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist"
        });
    }
};