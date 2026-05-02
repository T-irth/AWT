import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    axios.get('/api/products?limit=1').then(res => setStats(s => ({ ...s, products: res.data.total })));
    axios.get('/api/orders/all').then(res => {
      const orders = res.data;
      setRecentOrders(orders.slice(0, 5));
      setStats(s => ({
        ...s,
        orders: orders.length,
        revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((t, o) => t + o.totalAmount, 0)
      }));
    });
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, icon: '📦', link: '/admin/products', color: '#00c896' },
    { label: 'Total Orders', value: stats.orders, icon: '🛒', link: '/admin/orders', color: '#ff6b35' },
    { label: 'Total Revenue', value: `₹${stats.revenue.toFixed(0)}`, icon: '💰', link: '/admin/orders', color: '#ffa502' },
  ];

  return (
    <div className="container admin-page">
      <div className="page-header">
        <h1>⚙️ Admin Dashboard</h1>
        <p style={{color:'var(--text-muted)'}}>Manage your SmartCart store</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <Link to={s.link} key={i} className="stat-card card" style={{'--accent-color': s.color}}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="admin-quick-links">
        <Link to="/admin/product-manager" className="btn btn-primary">🚀 Product Manager</Link>
        <Link to="/admin/products/add" className="btn btn-outline">+ Add Product</Link>
        <Link to="/admin/products" className="btn btn-outline">📦 All Products</Link>
        <Link to="/admin/orders" className="btn btn-outline">🛒 Orders</Link>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 style={{marginBottom:'1.25rem'}}>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p style={{color:'var(--text-muted)'}}>No orders yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="mono">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>₹{order.totalAmount?.toFixed(2)}</td>
                    <td><span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span></td>
                    <td><span className="badge badge-primary">{order.orderStatus}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/admin/orders" style={{display:'block', marginTop:'1rem', color:'var(--primary)'}}>View all orders →</Link>
      </div>
    </div>
  );
}
