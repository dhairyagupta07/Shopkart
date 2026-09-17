import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover"
      />

      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">
          {product.category}
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {product.name}
        </h2>

        <p className="text-xl font-bold text-gray-900 mb-2">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="text-sm text-gray-600 mb-4">
          {product.stock > 0
            ? `${product.stock} units left`
            : "Out of stock"}
        </p>

        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;