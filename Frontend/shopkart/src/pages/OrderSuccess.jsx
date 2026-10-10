import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            if (order) {
                return;
            }

            try {
                setLoading(true);
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch {
                setError("Unable to load your order details.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, order]);

    if (loading) {
        return (
            <div className="page-shell">
                <Navbar />
                <main className="state-panel">
                    <p>Loading your order...</p>
                </main>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="page-shell">
                <Navbar />
                <main className="state-panel error-panel">
                    <div>
                        <p>{error || "Order not found."}</p>
                        <button className="primary-button" onClick={() => navigate("/orders")}>My Orders</button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <Navbar />

            <main className="success-page">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h1>Order Placed Successfully</h1>
                    <p className="success-subtitle">Your order has been saved successfully.</p>

                    <div className="success-meta">
                        <div>
                            <span>Order ID</span>
                            <strong>{order._id}</strong>
                        </div>
                        <div>
                            <span>Total</span>
                            <strong>₹{(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>{order.status}</strong>
                        </div>
                    </div>

                    <div className="success-actions">
                        <button className="primary-button" onClick={() => navigate("/orders")}>View My Orders</button>
                        <button className="secondary-button" onClick={() => navigate("/products")}>Continue Shopping</button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default OrderSuccess;
