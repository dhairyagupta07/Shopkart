import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.phone
        ) {
            setError("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            await api.post("/customers/register", formData);

            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <aside className="auth-aside">
                <div className="brand">ShopKart<span style={{ color: "var(--coral)" }}>.</span></div>
                <div className="aside-copy"><div className="eyebrow">A little more you</div><h2>Make room for the good stuff.</h2><p>Join a community that shops with intention.</p></div>
            </aside>
            <main className="auth-main">
            <form
                onSubmit={handleSubmit}
                className="auth-card auth-form"
            >
                <div className="eyebrow">New member</div>
                <h1>
                    Create Account
                </h1>

                <p className="intro">
                    Join ShopKart today
                </p>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="field-input"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="field-input"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="field-input"
                />

                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="field-input"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="primary-button"
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="form-switch">
                    Already have an account?{" "}
                    <span
                        className="text-link"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </span>
                </p>
            </form>
            </main>
        </div>
    );
}

export default Register;