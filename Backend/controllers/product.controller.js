import Product from "../models/product.model.js";

// Create Product
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            category,
            image,
            stock
        });

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// Get All Products
export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        const filter = {};

        // Search by product name
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // Filter by category
        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
};


// Get Single Product
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }
};