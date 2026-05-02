import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();
  const { user } = useAuth();

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image-wrap">
          {product.image ? (
            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
          ) : (
            <div className="product-placeholder">🛍️</div>
          )}
          {product.discount > 0 && (
            <span className="discount-tag">-{product.discount}%</span>
          )}
        </div>
      </Link>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price">
          <span className="final-price">₹{finalPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="original-price">₹{product.price.toFixed(2)}</span>
          )}
        </div>
        <div className="product-meta">
          <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        {user && (
          <button
            className="btn btn-primary add-cart-btn"
            onClick={() => addToCart(product._id)}
            disabled={loading || product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
          </button>
        )}
      </div>
    </div>
  );
}
