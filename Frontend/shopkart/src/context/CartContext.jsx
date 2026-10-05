import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/cart");
            setCartItems(response.data.cart || []);
        } catch (err) {
            console.error(err);
            setCartItems([]);
            setError("Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        const response = await api.post(`/cart/${productId}`);
        setCartItems(response.data.cart || []);
        return response.data;
    };

    const updateQuantity = async (productId, quantity) => {
        const response = await api.patch(`/cart/${productId}`, { quantity });
        setCartItems(response.data.cart || []);
        return response.data;
    };

    const removeFromCart = async (productId) => {
        const response = await api.delete(`/cart/${productId}`);
        setCartItems(response.data.cart || []);
        return response.data;
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const cartCount = useMemo(
        () => cartItems.reduce((total, item) => total + (item.quantity || 0), 0),
        [cartItems]
    );

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
                0
            ),
        [cartItems]
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                loading,
                error,
                fetchCart,
                addToCart,
                updateQuantity,
                removeFromCart,
                cartCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }

    return context;
};
