import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
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

        if (!formData.email || !formData.password) {
            setError("All fields are required");
            return;
        }

        try {
            setLoading(true);

            await api.post("/customers/login", formData);

            navigate("/home");
        } catch {
            setError("Invalid Credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <aside className="auth-aside">
                <div className="brand">ShopKart<span style={{ color: "var(--coral)" }}>.</span></div>
                <div className="aside-copy"><div className="eyebrow">Everyday, better</div><h2>Good things are worth coming back to.</h2><p>A calmer way to keep track of the things you love.</p></div>
            </aside>
            <main className="auth-main">
            <form onSubmit={handleSubmit} className="auth-card auth-form">
                <div className="eyebrow">Member sign in</div>
                <h1>Welcome back</h1>

                <p className="intro">
                    Login to your ShopKart account
                </p>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <div className="field"><label htmlFor="login-email">Email address</label><input id="login-email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} /></div>

                <div className="field"><label htmlFor="login-password">Password</label><input id="login-password" type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} /></div>

                <button
                    type="submit"
                    disabled={loading}
                    className="primary-button"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="form-switch">
                    Don't have an account?{" "}
                    <span
                        className="text-link"
                        onClick={() => navigate("/register")}
                    >
                        Create Account
                    </span>
                </p>
            </form>
            </main>
        </div>
    );
}

export default Login;