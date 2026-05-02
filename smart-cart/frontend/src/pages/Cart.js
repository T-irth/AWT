import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
          <Link to="/scanner" className="btn btn-outline" style={{marginLeft:'1rem'}}>📷 Scan Barcode</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shopping Cart ({cart.items.length} items)</h1>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.items.map(item => {
            const product = item.product;
            if (!product) return null;
            return (
              <div key={item._id} className="cart-item card">
                <div className="cart-item-image">
                  {product.image ? (
                    <img src={`http://localhost:5000${product.image}`} alt={product.name} />
                  ) : <div className="item-placeholder">🛍️</div>}
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${product._id}`} className="item-name">{product.name}</Link>
                  <span className="item-cat">{product.category}</span>
                  <span className="item-price">₹{item.price.toFixed(2)} each</span>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button onClick={() => updateQuantity(product._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(product._id, item.quantity + 1)}>+</button>
                  </div>
                  <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(product._id)}>🗑</button>
                </div>
              </div>
            );
          })}
          <button className="btn btn-danger clear-cart-btn" onClick={clearCart}>🗑 Clear Cart</button>
        </div>

        {/* Order Summary */}
        <div className="cart-summary card">
          <h3>Order Summary</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({cart.items.reduce((t,i)=>t+i.quantity,0)} items)</span>
              <span>₹{cart.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="free-text">FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{cart.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
          <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <Link to="/products" className="continue-shopping">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
