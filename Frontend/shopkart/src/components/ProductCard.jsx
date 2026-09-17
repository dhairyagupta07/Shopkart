import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-card-body">
        <p className="product-category">
          {product.category}
        </p>

        <h2 className="product-name">
          {product.name}
        </h2>

        <p className="product-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        <p className="product-stock">
          {product.stock > 0
            ? `${product.stock} units left`
            : "Out of stock"}
        </p>

        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="product-card-button"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;