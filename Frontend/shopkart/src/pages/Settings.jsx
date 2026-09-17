import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/customers/me");
                setUser(response.data);
            } catch {
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (!oldPassword.trim() || !newPassword.trim()) {
            setPasswordError("Please enter both your current and new passwords.");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters long.");
            return;
        }

        try {
            setSubmitting(true);
            await api.patch("/customers/change-password", {
                oldPassword,
                newPassword,
            });

            setPasswordSuccess("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            setPasswordError(error.response?.data?.message || "Something went wrong while updating your password.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="page-shell loading-state"><p>Loading your settings...</p></div>;
    }

    if (!user) return null;

    return (
        <div className="page-shell">
            <Navbar />

            <main className="settings-page">
                <div className="settings-header">
                    <div className="eyebrow">Account</div>
                    <h1>Settings</h1>
                    <p>Manage your profile details and keep your account secure.</p>
                </div>

                <div className="settings-grid">
                    <section className="settings-card">
                        <h2>Profile</h2>
                        <div className="detail-row"><span>Name</span><strong>{user.fullName}</strong></div>
                        <div className="detail-row"><span>Email</span><strong>{user.email}</strong></div>
                        <div className="detail-row"><span>Phone</span><strong>{user.phone}</strong></div>
                    </section>

                    <section className="settings-card">
                        <h2>Change password</h2>
                        <form className="password-form" onSubmit={handleChangePassword}>
                            <div className="field">
                                <label htmlFor="oldPassword">Current password</label>
                                <input
                                    id="oldPassword"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(event) => setOldPassword(event.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="newPassword">New password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <button type="submit" className="primary-button" disabled={submitting}>
                                {submitting ? "Updating..." : "Update password"}
                            </button>

                            {passwordError && <p className="form-error">{passwordError}</p>}
                            {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Settings;
