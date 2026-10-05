import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import WishlistProvider from "./context/WishlistContext";

function App() {
    return (
        <CartProvider>
            <WishlistProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/cart" element={<Cart />} />
                    </Routes>
                </BrowserRouter>
            </WishlistProvider>
        </CartProvider>
    );
}

export default App;