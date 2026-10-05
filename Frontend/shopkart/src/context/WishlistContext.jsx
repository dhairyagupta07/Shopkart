import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import WishlistContext from "./wishlist-context";

export const WishlistProvider = ({ children }) => {
    const [wishlistCount, setWishlistCount] = useState(0);
    const requestSequence = useRef(0);

    const refreshWishlist = useCallback(async () => {
        const requestId = ++requestSequence.current;
        const response = await api.get("/wishlist");

        if (requestId === requestSequence.current) {
            setWishlistCount(response.data.count ?? response.data.wishlist?.length ?? 0);
        }

        return response.data;
    }, []);

    const addToWishlist = useCallback(async (productId) => {
        const response = await api.post(`/wishlist/${productId}`);
        requestSequence.current += 1;
        setWishlistCount((count) => count + 1);
        return response.data;
    }, []);

    const removeFromWishlist = useCallback(async (productId) => {
        const response = await api.delete(`/wishlist/${productId}`);
        requestSequence.current += 1;
        setWishlistCount((count) => Math.max(0, count - 1));
        return response.data;
    }, []);

    const clearWishlist = useCallback(() => {
        requestSequence.current += 1;
        setWishlistCount(0);
    }, []);

    useEffect(() => {
        let active = true;
        const requestId = ++requestSequence.current;

        api.get("/wishlist")
            .then((response) => {
                if (active && requestId === requestSequence.current) {
                    setWishlistCount(
                        response.data.count ?? response.data.wishlist?.length ?? 0
                    );
                }
            })
            .catch(() => {
                if (active && requestId === requestSequence.current) {
                    setWishlistCount(0);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    return <WishlistContext.Provider value={{
        wishlistCount,
        refreshWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
    }}>{children}</WishlistContext.Provider>;
};

export default WishlistProvider;
