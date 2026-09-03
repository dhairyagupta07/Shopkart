import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();

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
            <div className="brand">ShopKart<span style={{ color: "var(--coral)" }}>.</span></div>

            <button
                onClick={handleLogout}
                className="logout-button"
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;