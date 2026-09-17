import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import Settings from "./pages/Settings";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Navigate to="/login" />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/home" element={<Home />} />

                <Route path="/products" element={<Products />} />

                <Route path="/settings" element={<Settings />} />

                <Route path="/products/:id" element={<ProductDetails />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;