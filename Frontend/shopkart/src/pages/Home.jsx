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
            } catch (err) {
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">
                    Loading...
                </p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Welcome, {user.fullName}!
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Welcome to your ShopKart account.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Your Profile
                    </h2>

                    <div className="space-y-4">

                        <div>
                            <p className="text-sm text-gray-500">
                                Name
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {user.fullName}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Email
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Phone
                            </p>

                            <p className="text-lg font-medium text-gray-900">
                                {user.phone}
                            </p>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}

export default Home;