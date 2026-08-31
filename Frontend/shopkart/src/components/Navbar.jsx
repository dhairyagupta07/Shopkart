import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/customers/logout");

            navigate("/login");
        } catch (err) {
            console.error("Logout failed");
        }
    };

    return (
        <nav className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md">
            <h2 className="text-2xl font-bold">
                ShopKart
            </h2>

            <button
                onClick={handleLogout}
                className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;