import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import api from "../services/api";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/products", {
                params: {
                    search: search || undefined,
                    category: category || undefined
                }
            });

            setProducts(response.data.products);
        } catch (error) {
            console.error(error);
            setError("Something went wrong while loading products.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category]);

    return (
        <div className="page-shell">
            <Navbar />

            <main className="products-page">
                <div className="section-heading">
                    <div className="eyebrow">Shop by need</div>
                    <h1>Products</h1>
                    <p>Browse essentials and standout picks for every day.</p>
                </div>

                <div className="products-toolbar">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-field"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Books">Books</option>
                        <option value="Home">Home</option>
                    </select>
                </div>

                {loading && (
                    <div className="state-panel">
                        <p>Loading products...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-panel error-panel">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="state-panel">
                        <p>No products found.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Products;