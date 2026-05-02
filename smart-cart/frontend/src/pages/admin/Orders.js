import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Admin.css';

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  placed: 'badge-warning', confirmed: 'badge-primary', processing: 'badge-primary',
  shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    axios.get('/api/orders/all').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, field, value) => {
    try {
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { [field]: value });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...data } : o));
      toast.success('Order updated!');
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="container admin-page">
      <div className="admin-page-header">
        <h1>🛒 All Orders</h1>
        <p style={{color:'var(--text-muted)'}}>{orders.length} total orders</p>
      </div>

      <div className="orders-admin-list">
        {orders.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>No orders found</div>
        ) : orders.map(order => (
          <div key={order._id} className="card order-admin-card">
            <div className="order-admin-header" onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}>
              <div className="order-admin-meta">
                <span className="mono">#{order._id.slice(-8).toUpperCase()}</span>
                <span>{order.user?.name} ({order.user?.email})</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="order-admin-right">
                <span className="order-amount">₹{order.totalAmount?.toFixed(2)}</span>
                <span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
                <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{order.paymentStatus}</span>
                <span className="expand-icon">{expandedId === order._id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedId === order._id && (
              <div className="order-admin-expanded">
                {/* Items */}
                <div className="expanded-items">
                  <h4>Items</h4>
                  {order.items.map((item, i) => (
                    <div key={i} className="expanded-item-row">
                      <span>{item.name}</span>
                      <span>× {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping */}
                {order.shippingAddress?.name && (
                  <div className="expanded-shipping">
                    <h4>Shipping Address</h4>
                    <p>{order.shippingAddress.name} | {order.shippingAddress.phone}</p>
                    <p>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  </div>
                )}

                {/* Update Controls */}
                <div className="update-controls">
                  <div className="form-group">
                    <label>Order Status</label>
                    <select className="form-control" value={order.orderStatus}
                      onChange={e => updateStatus(order._id, 'orderStatus', e.target.value)}>
                      {ORDER_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <select className="form-control" value={order.paymentStatus}
                      onChange={e => updateStatus(order._id, 'paymentStatus', e.target.value)}>
                      {['pending', 'paid', 'failed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
