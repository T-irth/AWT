import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/products?limit=8').then(res => setFeaturedProducts(res.data.products));
    axios.get('/api/products/categories').then(res => setCategories(res.data));
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-tag">🔥 Smart Shopping Experience</span>
            <h1>Shop Smarter with <span className="highlight">Camera Scan</span></h1>
            <p>Add products to your cart instantly by scanning barcodes with your laptop camera. Fast, modern, and seamless shopping.</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Browse Products</Link>
              <Link to="/scanner" className="btn btn-outline">📷 Scan Barcode</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-float">
              <div className="hero-icon">🛒</div>
              <p>Scan & Shop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Shop by Category</h2>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link key={cat} to={`/products?category=${cat}`} className="category-card">
                  <span className="cat-icon">🏷️</span>
                  <span>{cat}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="see-all">See All →</Link>
          </div>
          <div className="grid-products">
            {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon: '📷', title: 'Barcode Scanner', desc: 'Use your laptop camera to scan product barcodes and add instantly to cart' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Pay with Stripe, Razorpay, or Cash on Delivery — 100% secure' },
              { icon: '⚡', title: 'Admin Dashboard', desc: 'Manage products, orders and inventory from a powerful admin panel' },
              { icon: '📦', title: 'Order Tracking', desc: 'Real-time order status updates from placement to delivery' }
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
