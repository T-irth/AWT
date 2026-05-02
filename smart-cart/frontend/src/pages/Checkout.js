import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Checkout.css';

export default function Checkout() {
  const { cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });

  const cartItems = cart.items?.map(item => ({
    product: item.product?._id,
    name: item.product?.name,
    quantity: item.quantity,
    price: item.price,
    image: item.product?.image
  })) || [];

  const totalAmount = cart.totalAmount || 0;

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    return required.every(f => address[f].trim());
  };

  // ===== RAZORPAY =====
  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/payment/razorpay/create-order', { amount: totalAmount });

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'SmartCart',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const { data: orderData } = await axios.post('/api/payment/razorpay/verify', {
              ...response,
              shippingAddress: address,
              cartItems,
              totalAmount
            });
            toast.success('Payment successful! 🎉');
            navigate(`/order-success/${orderData.order._id}`);
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: address.phone },
        theme: { color: '#00c896' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  // ===== COD =====
  const handleCOD = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/payment/cod/place-order', {
        shippingAddress: address, cartItems, totalAmount
      });
      toast.success('Order placed! Cash on Delivery 🏠');
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // ===== STRIPE =====
  const handleStripe = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/payment/stripe/create-intent', { amount: totalAmount });
      // For demo: auto-confirm (in real app use Stripe Elements)
      toast('Stripe payment intent created. Integrate Stripe Elements for full flow.', { icon: 'ℹ️' });
      setLoading(false);
    } catch (err) {
      toast.error('Stripe initiation failed');
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) { toast.error('Please fill all address fields'); return; }
    if (paymentMethod === 'razorpay') await handleRazorpay();
    else if (paymentMethod === 'cod') await handleCOD();
    else await handleStripe();
  };

  return (
    <div className="container">
      {/* Load Razorpay SDK */}
      {!window.Razorpay && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      )}

      <div className="page-header"><h1>Checkout</h1></div>

      <div className="checkout-layout">
        {/* Address */}
        <div>
          <div className="card checkout-section">
            <h3>📍 Delivery Address</h3>
            <div className="address-grid">
              {[
                { name: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { name: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                { name: 'street', label: 'Street Address', placeholder: '123 Main Street' },
                { name: 'city', label: 'City', placeholder: 'Mumbai' },
                { name: 'state', label: 'State', placeholder: 'Maharashtra' },
                { name: 'pincode', label: 'Pincode', placeholder: '400001' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label>{field.label}</label>
                  <input className="form-control" name={field.name} placeholder={field.placeholder}
                    value={address[field.name]} onChange={handleAddressChange} required />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card checkout-section">
            <h3>💳 Payment Method</h3>
            <div className="payment-options">
              {[
                { id: 'razorpay', label: 'Razorpay', sub: 'UPI, Cards, Net Banking, Wallets', icon: '💳' },
                { id: 'stripe', label: 'Stripe', sub: 'International Cards', icon: '🌐' },
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: '💵' }
              ].map(opt => (
                <label key={opt.id} className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value={opt.id}
                    checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)} />
                  <span className="pay-icon">{opt.icon}</span>
                  <div>
                    <div className="pay-label">{opt.label}</div>
                    <div className="pay-sub">{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card order-summary-checkout">
          <h3>Order Summary</h3>
          <div className="order-items-list">
            {cart.items?.map(item => (
              <div key={item._id} className="order-item-row">
                <span className="order-item-name">{item.product?.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total-row">
            <span>Total</span>
            <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary place-order-btn" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? 'Processing...' : `Place Order — ₹${totalAmount.toFixed(2)}`}
          </button>
          <p className="secure-note">🔒 100% Secure & Encrypted Payment</p>
        </div>
      </div>
    </div>
  );
}
