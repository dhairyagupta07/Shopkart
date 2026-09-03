import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div className="page-shell loading-state"><p>Loading your space...</p></div>;
    }

    if (!user) return null;

    return (
        <div className="page-shell">
            <Navbar />
            <main className="dashboard">
                <div className="dashboard-heading">
                    <div className="eyebrow">Your space</div>
                    <h1>Welcome, {user.fullName}.</h1>
                    <p>Welcome to your ShopKart account.</p>
                </div>
                <div className="profile-panel">
                    <section className="profile-intro">
                        <div className="avatar">{user.fullName.charAt(0).toUpperCase()}</div>
                        <h2>Your profile</h2>
                        <p>Your ShopKart details, all in one place.</p>
                    </section>
                    <section className="profile-details">
                        <h3>Account details</h3>
                        <div className="detail-row"><span>Name</span><strong>{user.fullName}</strong></div>
                        <div className="detail-row"><span>Email</span><strong>{user.email}</strong></div>
                        <div className="detail-row"><span>Phone</span><strong>{user.phone}</strong></div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default Home;
