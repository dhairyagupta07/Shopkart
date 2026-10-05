import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useWishlist } from "../context/useWishlist";

function Wishlist() {
    const navigate = useNavigate();
    const { refreshWishlist, removeFromWishlist } = useWishlist();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchWishlist = useCallback(async () => {
        try {
            const response = await refreshWishlist();
            setWishlist(response.wishlist);
            setError("");

        } catch (error) {
            console.error(error);

            setError("Unable to load wishlist.");

        } finally {
            setLoading(false);
        }
    }, [refreshWishlist]);

    useEffect(() => {
        let active = true;

        refreshWishlist()
            .then((response) => {
                if (active) {
                    setWishlist(response.wishlist);
                    setError("");
                }
            })
            .catch((error) => {
                console.error(error);
                if (active) {
                    setError("Unable to load wishlist.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [refreshWishlist]);

    const retryFetchWishlist = () => {
        setLoading(true);
        setError("");
        fetchWishlist();
    };

    const handleRemove = async (productId) => {
        try {
            await removeFromWishlist(productId);

            setWishlist((currentWishlist) =>
                currentWishlist.filter(
                    (product) => product._id !== productId
                )
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to remove product from wishlist."
            );
        }
    };

    return (
        <div className="page-shell">

            <Navbar />

            <main className="wishlist-page">

                <div className="section-heading">
                    <div className="eyebrow">Saved for later</div>

                    <h1>My Wishlist</h1>

                    {!loading && !error && (
                        <p>
                            {wishlist.length}{" "}
                            {wishlist.length === 1
                                ? "product"
                                : "products"}{" "}
                            saved
                        </p>
                    )}
                </div>

                {loading && (
                    <div className="state-panel">
                        <p>Loading your wishlist...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-panel error-panel">
                        <div>
                            <p>Something went wrong.</p>
                            <p>{error}</p>

                            <button
                                onClick={retryFetchWishlist}
                                className="primary-button"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && wishlist.length === 0 && (
                    <div className="wishlist-empty">

                        <div className="wishlist-empty-icon">
                            ❤️
                        </div>

                        <h2>Your wishlist is empty</h2>

                        <p>
                            Save products you love and find them here later.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="primary-button"
                        >
                            Browse Products
                        </button>

                    </div>
                )}

                {!loading && !error && wishlist.length > 0 && (
                    <div className="wishlist-grid">

                        {wishlist.map((product) => (
                            <div
                                className="wishlist-card"
                                key={product._id}
                            >

                                <div className="wishlist-image-wrap">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="wishlist-image"
                                    />
                                </div>

                                <div className="wishlist-card-body">

                                    <p className="product-category">
                                        {product.category}
                                    </p>

                                    <h2 className="product-name">
                                        {product.name}
                                    </h2>

                                    <p className="product-price">
                                        ₹{product.price.toLocaleString("en-IN")}
                                    </p>

                                    <p className="product-stock">
                                        {product.stock > 0
                                            ? `${product.stock} units left`
                                            : "Out of stock"}
                                    </p>

                                    <div className="wishlist-actions">

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/products/${product._id}`
                                                )
                                            }
                                            className="primary-button"
                                        >
                                            View Details
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleRemove(product._id)
                                            }
                                            className="secondary-button"
                                        >
                                            Remove ♥
                                        </button>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}

export default Wishlist;