import { useEffect, useState } from "react";
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
        <div className="max-w-7xl mx-auto px-4 py-8">

            <h1 className="text-3xl font-bold mb-8">
                Products
            </h1>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">

                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border rounded-md px-4 py-2"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-md px-4 py-2"
                >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Books">Books</option>
                    <option value="Home">Home</option>
                </select>

            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <p className="text-lg">Loading products...</p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && products.length === 0 && (
                <div className="flex justify-center items-center min-h-[40vh]">
                    <p className="text-lg">No products found.</p>
                </div>
            )}

            {/* Products */}
            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </div>
            )}

        </div>
    );
};

export default Products;