import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return null;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div className="container product-detail-page">
      <button className="btn btn-outline back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-detail-grid">
        <div className="product-detail-image">
          {product.image ? (
            <img src={`http://localhost:5000${product.image}`} alt={product.name} />
          ) : (
            <div className="detail-placeholder">🛍️</div>
          )}
          {product.discount > 0 && <span className="discount-tag-lg">-{product.discount}% OFF</span>}
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          {product.brand && <p className="brand">Brand: <strong>{product.brand}</strong></p>}
          <p className="description">{product.description}</p>

          <div className="price-section">
            <span className="big-price">₹{finalPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="original-price-lg">₹{product.price.toFixed(2)}</span>
                <span className="savings">You save ₹{(product.price - finalPrice).toFixed(2)}</span>
              </>
            )}
          </div>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">✅ In Stock ({product.stock} {product.unit || 'units'} available)</span>
            ) : (
              <span className="out-stock">❌ Out of Stock</span>
            )}
          </div>

          {product.barcode && (
            <div className="barcode-info">
              <span>📊 Barcode: <code>{product.barcode}</code></span>
            </div>
          )}

          {user && product.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={() => addToCart(product._id, quantity)}>
                🛒 Add to Cart
              </button>
            </div>
          )}

          {!user && (
            <p style={{color:'var(--text-muted)', marginTop:'1rem'}}>
              <a href="/login" style={{color:'var(--primary)'}}>Login</a> to add items to cart
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
