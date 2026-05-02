import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          🛒 <span>SmartCart</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link>
          {user && <Link to="/scanner" onClick={() => setMenuOpen(false)}>📷 Scan</Link>}

          {user?.role === 'admin' && (
            <div className="admin-dropdown" onMouseLeave={() => setAdminOpen(false)}>
              <button className="admin-menu-btn" onMouseEnter={() => setAdminOpen(true)} onClick={() => setAdminOpen(!adminOpen)}>
                ⚙️ Admin ▾
              </button>
              {adminOpen && (
                <div className="dropdown-menu">
                  <Link to="/admin" onClick={() => { setMenuOpen(false); setAdminOpen(false); }}>📊 Dashboard</Link>
                  <Link to="/admin/product-manager" onClick={() => { setMenuOpen(false); setAdminOpen(false); }} className="dropdown-highlight">➕ Add Products</Link>
                  <Link to="/admin/products" onClick={() => { setMenuOpen(false); setAdminOpen(false); }}>📦 All Products</Link>
                  <Link to="/admin/barcode/all" onClick={() => { setMenuOpen(false); setAdminOpen(false); }}>🖨️ Print Barcodes</Link>
                  <Link to="/admin/orders" onClick={() => { setMenuOpen(false); setAdminOpen(false); }}>🛒 Orders</Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link to="/my-orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
                🛒 Cart {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
              </Link>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
