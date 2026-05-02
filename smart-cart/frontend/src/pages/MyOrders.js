import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const STATUS_COLORS = {
  placed: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary',
  shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/my-orders').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="container">
      <div className="page-header"><h1>My Orders</h1></div>

      {orders.length === 0 ? (
        <div style={{textAlign:'center', padding:'4rem', color:'var(--text-muted)'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>📦</div>
          <h3>No orders yet</h3>
          <p>Start shopping to place your first order!</p>
          <Link to="/products" className="btn btn-primary" style={{marginTop:'1rem'}}>Shop Now</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="card order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                <div className="order-badges">
                  <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-primary'}`}>{order.orderStatus}</span>
                  <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="order-item-chip">
                    {item.image && <img src={`http://localhost:5000${item.image}`} alt={item.name} />}
                    <span>{item.name} × {item.quantity}</span>
                  </div>
                ))}
                {order.items.length > 3 && <span className="more-items">+{order.items.length - 3} more</span>}
              </div>

              <div className="order-card-footer">
                <div className="order-meta">
                  <span>Payment: <strong>{order.paymentMethod?.toUpperCase()}</strong></span>
                  <span>Total: <strong className="order-total">₹{order.totalAmount?.toFixed(2)}</strong></span>
                </div>
                <Link to={`/order-success/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
