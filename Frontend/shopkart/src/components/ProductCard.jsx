import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [saving, setSaving] = useState(false);
    const [wishlistError, setWishlistError] = useState("");
    const [added, setAdded] = useState(false);
    const [cartError, setCartError] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);

    const handleWishlist = async () => {
        if (saving) return;

        try {
            setSaving(true);
            setWishlistError("");

            await api.post(`/wishlist/${product._id}`);
            setAdded(true);
        } catch (error) {
            console.error(error);

            if (error.response?.status === 409) {
                setAdded(true);
            } else {
                setWishlistError(
                    error.response?.data?.message ||
                    "Unable to save product. Please try again."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAddToCart = async () => {
        if (addingToCart || product.stock === 0) return;

        try {
            setAddingToCart(true);
            setCartError("");
            await addToCart(product._id);
        } catch (error) {
            console.error(error);
            setCartError(
                error.response?.data?.message ||
                "Unable to add product to cart. Please try again."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-wrap">
                <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                />
            </div>

            <div className="product-card-body">
                <p className="product-category">{product.category}</p>
                <h2 className="product-name">{product.name}</h2>
                <p className="product-price">₹{product.price.toLocaleString("en-IN")}</p>
                <p className="product-stock">
                    {product.stock > 0
                        ? `${product.stock} units left`
                        : "Out of stock"}
                </p>

                <div className="card-actions">
                    <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="product-card-button"
                    >
                        View Details
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock === 0}
                        className="cart-button"
                    >
                        {addingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                </div>

                <button
                    onClick={handleWishlist}
                    disabled={saving || added}
                    className="wishlist-button"
                >
                    {saving
                        ? "⏳ Saving..."
                        : added
                            ? "♥ Added to Wishlist"
                            : "♡ Add to Wishlist"}
                </button>

                {wishlistError && <p className="wishlist-error">{wishlistError}</p>}
                {cartError && <p className="wishlist-error">{cartError}</p>}
            </div>
        </div>
    );
};

export default ProductCard;