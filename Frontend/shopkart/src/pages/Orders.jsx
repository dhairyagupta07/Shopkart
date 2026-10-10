/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/orders");
            setOrders(response.data.orders || []);
        } catch {
            setError("Unable to load your orders right now.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchOrders();
    }, []);

    return (
        <div className="page-shell">
            <Navbar />

            <main className="orders-page">
                <div className="section-heading">
                    <div className="eyebrow">Your purchases</div>
                    <h1>My Orders</h1>
                </div>

                {loading && (
                    <div className="state-panel">
                        <p>Loading your orders...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-panel error-panel">
                        <div>
                            <p>{error}</p>
                            <button className="primary-button" onClick={fetchOrders}>Try Again</button>
                        </div>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="empty-state-box">
                        <div className="wishlist-empty-icon">📦</div>
                        <h2>You have not placed any orders yet.</h2>
                        <button className="primary-button" onClick={() => navigate("/products")}>
                            Start Shopping
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article className="order-card" key={order._id}>
                                <div className="order-card-header">
                                    <div>
                                        <p className="order-id">Order #{order._id.slice(-8)}</p>
                                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                                    </div>
                                    <span className="order-status">{order.status}</span>
                                </div>

                                <div className="order-items-summary">
                                    {order.items.map((item) => (
                                        <p key={`${order._id}-${item.product}`}>
                                            {item.name} × {item.quantity}
                                        </p>
                                    ))}
                                </div>

                                <div className="order-summary-footer">
                                    <strong>Total: ₹{(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                                    <button className="secondary-button" onClick={() => navigate(`/order-success/${order._id}`)}>
                                        View Details
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Orders;
