import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const initialAddress = {
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
};

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        const existingScript = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");

        if (existingScript) {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            existingScript.addEventListener("load", () => resolve(true), { once: true });
            existingScript.addEventListener("error", () => resolve(false), { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, fetchCart, clearCart } = useCart();
    const [shippingAddress, setShippingAddress] = useState(initialAddress);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        if (!cartItems || cartItems.length === 0) {
            navigate("/cart");
        }
    }, [cartItems, navigate]);

    const orderSummary = useMemo(() => {
        const itemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
        const total = cartItems.reduce(
            (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
            0
        );

        return { itemCount, total };
    }, [cartItems]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
    };

    const validateForm = () => {
        const nextErrors = {};

        Object.entries(shippingAddress).forEach(([key, value]) => {
            const trimmedValue = String(value).trim();
            if (!trimmedValue) {
                nextErrors[key] = "This field is required.";
            }
        });

        if (shippingAddress.fullName && /^\s+$/.test(shippingAddress.fullName)) {
            nextErrors.fullName = "Full name cannot be empty.";
        }

        if (shippingAddress.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{8,15}$/.test(shippingAddress.phone.trim())) {
            nextErrors.phone = "Phone number is invalid.";
        }

        if (shippingAddress.pincode && !/^\d{6}$/.test(shippingAddress.pincode.trim())) {
            nextErrors.pincode = "Pincode must contain 6 digits.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handlePayment = async () => {
        const response = await api.post("/orders/create-payment-order", {
            shippingAddress,
        });

        const { razorpayOrderId, amount, currency, key, shopKartOrderId } = response.data;
        const scriptReady = await loadRazorpayScript();

        if (!scriptReady || !window.Razorpay) {
            throw new Error("Razorpay checkout is unavailable right now.");
        }

        const paymentObject = new window.Razorpay({
            key,
            amount,
            currency,
            name: "ShopKart",
            description: "ShopKart Order",
            order_id: razorpayOrderId,
            prefill: {
                name: shippingAddress.fullName,
                contact: shippingAddress.phone,
            },
            handler: async function (paymentResponse) {
                try {
                    const verifyResponse = await api.post("/orders/verify-payment", {
                        shopKartOrderId,
                        razorpay_order_id: paymentResponse.razorpay_order_id,
                        razorpay_payment_id: paymentResponse.razorpay_payment_id,
                        razorpay_signature: paymentResponse.razorpay_signature,
                    });

                    clearCart();
                    await fetchCart();
                    navigate(`/order-success/${shopKartOrderId}`, {
                        state: { order: verifyResponse.data.order },
                    });
                } catch (error) {
                    const message = error.response?.data?.message || "Payment verification failed.";
                    setSubmitError(message);
                }
            },
            theme: {
                color: "#e05b43",
            },
        });

        paymentObject.on("payment.failed", function () {
            setSubmitError("Payment failed. Your cart has not been cleared. Please try again.");
        });

        paymentObject.open();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError("");

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            await handlePayment();
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Unable to place your order.";
            setSubmitError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!cartItems || cartItems.length === 0) {
        return null;
    }

    return (
        <div className="page-shell">
            <Navbar />

            <main className="checkout-page">
                <div className="section-heading">
                    <div className="eyebrow">Secure checkout</div>
                    <h1>Checkout</h1>
                </div>

                <div className="checkout-layout">
                    <form className="checkout-form-card" onSubmit={handleSubmit} noValidate>
                        <h2>Shipping Details</h2>

                        <div className="checkout-grid">
                            <label className="field">
                                <span>Full Name</span>
                                <input
                                    name="fullName"
                                    value={shippingAddress.fullName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                />
                                {errors.fullName && <small className="field-error">{errors.fullName}</small>}
                            </label>

                            <label className="field">
                                <span>Phone</span>
                                <input
                                    name="phone"
                                    value={shippingAddress.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                />
                                {errors.phone && <small className="field-error">{errors.phone}</small>}
                            </label>

                            <label className="field field-full-width">
                                <span>Address</span>
                                <input
                                    name="addressLine1"
                                    value={shippingAddress.addressLine1}
                                    onChange={handleChange}
                                    placeholder="Address Line"
                                />
                                {errors.addressLine1 && <small className="field-error">{errors.addressLine1}</small>}
                            </label>

                            <label className="field">
                                <span>City</span>
                                <input
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                />
                                {errors.city && <small className="field-error">{errors.city}</small>}
                            </label>

                            <label className="field">
                                <span>State</span>
                                <input
                                    name="state"
                                    value={shippingAddress.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                />
                                {errors.state && <small className="field-error">{errors.state}</small>}
                            </label>

                            <label className="field">
                                <span>Pincode</span>
                                <input
                                    name="pincode"
                                    value={shippingAddress.pincode}
                                    onChange={handleChange}
                                    placeholder="Pincode"
                                />
                                {errors.pincode && <small className="field-error">{errors.pincode}</small>}
                            </label>
                        </div>
                    </form>

                    <aside className="checkout-summary-card">
                        <h2>Order Summary</h2>
                        {cartItems.map((item) => (
                            <div className="checkout-line" key={item._id || item.product?._id}>
                                <span>
                                    {item.product?.name} × {item.quantity}
                                </span>
                                <strong>₹{((item.product?.price || 0) * (item.quantity || 0)).toLocaleString("en-IN")}</strong>
                            </div>
                        ))}

                        <div className="checkout-total-row">
                            <span>Total</span>
                            <strong>₹{orderSummary.total.toLocaleString("en-IN")}</strong>
                        </div>

                        {submitError && <div className="form-error">{submitError}</div>}

                        <button className="primary-button full-width" type="submit" disabled={submitting} onClick={handleSubmit}>
                            {submitting ? "Placing Order..." : "Place Order"}
                        </button>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default Checkout;
