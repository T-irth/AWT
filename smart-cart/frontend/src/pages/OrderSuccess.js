import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get(`/api/orders/${id}`).then(res => setOrder(res.data)).catch(() => {});
  }, [id]);

  return (
    <div className="container success-page">
      <div className="success-card card">
        <div className="success-icon">✅</div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-sub">Thank you for your purchase. Your order has been confirmed.</p>

        {order && (
          <div className="order-details">
            <div className="detail-row">
              <span>Order ID</span>
              <span className="mono">#{order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Payment Method</span>
              <span>{order.paymentMethod?.toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Payment Status</span>
              <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {order.paymentStatus}
              </span>
            </div>
            <div className="detail-row">
              <span>Order Status</span>
              <span className="badge badge-primary">{order.orderStatus}</span>
            </div>
            <div className="detail-row total">
              <span>Total Amount</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/my-orders" className="btn btn-primary">View My Orders</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
