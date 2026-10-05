import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const fetchWishlistCount = async () => {
            try {
                const response = await api.get("/wishlist");
                setWishlistCount(response.data.count ?? 0);
            } catch {
                setWishlistCount(0);
            }
        };

        fetchWishlistCount();
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/customers/logout");
            navigate("/login");
        } catch {
            console.error("Logout failed");
        }
    };

    return (
        <nav className="topbar">
            <div className="brand-group">
                <div
                    className="brand"
                    onClick={() => navigate("/home")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate("/home");
                        }
                    }}
                >
                    ShopKart<span>.</span>
                </div>

                <div className="nav-links" aria-label="Main navigation">
                    <NavLink
                        to="/home"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Products
                    </NavLink>
                    <NavLink
                        to="/wishlist"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                    </NavLink>
                    <NavLink
                        to="/cart"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                        Settings
                    </NavLink>
                </div>
            </div>

            <button onClick={handleLogout} className="logout-button">
                Logout
            </button>
        </nav>
    );
}

export default Navbar;