import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();
    const {
        cartItems,
        loading,
        error,
        fetchCart,
        updateQuantity,
        removeFromCart,
        subtotal,
    } = useCart();

    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleQuantityChange = async (productId, quantity, nextQuantity) => {
        if (nextQuantity < 1) return;

        const item = cartItems.find((entry) => entry.product?._id === productId);
        const maxStock = item?.product?.stock ?? quantity;

        if (nextQuantity > maxStock) {
            return;
        }

        await updateQuantity(productId, nextQuantity);
    };

    const handleRemoveItem = async (productId) => {
        await removeFromCart(productId);
    };

    return (
        <div className="page-shell">
            <Navbar />

            <main className="cart-page">
                <div className="section-heading">
                    <div className="eyebrow">Your basket</div>
                    <h1>My Cart</h1>
                </div>

                {loading && (
                    <div className="state-panel">
                        <p>Loading your cart...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-panel error-panel">
                        <div>
                            <p>Unable to load your cart.</p>
                            <button onClick={fetchCart} className="primary-button">
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && cartItems.length === 0 && (
                    <div className="cart-empty">
                        <div className="wishlist-empty-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven&apos;t added anything yet.</p>
                        <button
                            onClick={() => navigate("/products")}
                            className="primary-button"
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {!loading && !error && cartItems.length > 0 && (
                    <div className="cart-layout">
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div className="cart-item" key={item._id || item.product?._id}>
                                    <div className="cart-item-image-wrap">
                                        <img
                                            src={item.product?.image}
                                            alt={item.product?.name}
                                            className="cart-item-image"
                                        />
                                    </div>

                                    <div className="cart-item-content">
                                        <div>
                                            <p className="product-category">{item.product?.category}</p>
                                            <h3 className="product-name">{item.product?.name}</h3>
                                            <p className="product-price">
                                                ₹{(item.product?.price || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        <div className="cart-actions-row">
                                            <div className="quantity-control">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.product?._id,
                                                            item.quantity,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleQuantityChange(
                                                            item.product?._id,
                                                            item.quantity,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    disabled={item.quantity >= (item.product?.stock || 0)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={() => handleRemoveItem(item.product?._id)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="cart-summary">
                            <h2>Order Summary</h2>
                            <div className="summary-row">
                                <span>Items</span>
                                <strong>{itemCount}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                            </div>
                            <button className="primary-button full-width" type="button">
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Cart;
