import crypto from "crypto";
import mongoose from "mongoose";

import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import razorpay from "../config/razorpay.js";

const normalizeShippingAddress = (shippingAddress = {}) => ({
    fullName: typeof shippingAddress.fullName === "string" ? shippingAddress.fullName.trim() : "",
    phone: typeof shippingAddress.phone === "string" ? shippingAddress.phone.trim() : "",
    addressLine1: typeof shippingAddress.addressLine1 === "string" ? shippingAddress.addressLine1.trim() : "",
    city: typeof shippingAddress.city === "string" ? shippingAddress.city.trim() : "",
    state: typeof shippingAddress.state === "string" ? shippingAddress.state.trim() : "",
    pincode: typeof shippingAddress.pincode === "string" ? shippingAddress.pincode.trim() : "",
});

const validateShippingAddress = (shippingAddress) => {
    const normalized = normalizeShippingAddress(shippingAddress);

    if (!normalized.fullName || !normalized.phone || !normalized.addressLine1 || !normalized.city || !normalized.state || !normalized.pincode) {
        return "All shipping details are required.";
    }

    if (/^\s+$/.test(normalized.fullName) || /^\s+$/.test(normalized.addressLine1) || /^\s+$/.test(normalized.city) || /^\s+$/.test(normalized.state) || /^\s+$/.test(normalized.pincode) || /^\s+$/.test(normalized.phone)) {
        return "Shipping fields cannot contain only whitespace.";
    }

    const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{8,15}$/;
    if (!phonePattern.test(normalized.phone)) {
        return "Phone number is invalid.";
    }

    if (!/^\d{6}$/.test(normalized.pincode)) {
        return "Pincode must contain 6 digits.";
    }

    return null;
};

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body || {};
        const validationError = validateShippingAddress(shippingAddress);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock",
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty.",
            });
        }

        let totalAmount = 0;
        const items = [];

        for (const cartItem of user.cart) {
            const product = cartItem.product;

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products are no longer available.",
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`,
                });
            }

            const lineTotal = product.price * cartItem.quantity;
            totalAmount += lineTotal;

            items.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image,
            });
        }

        const shopKartOrder = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: normalizeShippingAddress(shippingAddress),
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: shopKartOrder._id.toString(),
        });

        shopKartOrder.razorpayOrderId = razorpayOrder.id;
        await shopKartOrder.save();

        return res.status(200).json({
            success: true,
            shopKartOrderId: shopKartOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Create payment order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order",
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body || {};

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification data.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(shopKartOrderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this order",
            });
        }

        if (razorpay_order_id !== order.razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment order reference",
            });
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature",
            });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const user = await Customer.findById(req.user._id);
        if (user) {
            user.cart = [];
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Verify payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to verify payment",
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this order",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get order by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};
