const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// ========== STRIPE ==========
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'inr' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses paise/cents
      currency,
      metadata: { userId: req.user._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/stripe/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress, cartItems, totalAmount } = req.body;
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') return res.status(400).json({ message: 'Payment not confirmed' });

    const order = await Order.create({
      user: req.user._id,
      items: cartItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      paymentId: paymentIntentId,
      orderStatus: 'confirmed'
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== RAZORPAY ==========
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency,
               key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature,
            shippingAddress, cartItems, totalAmount } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ message: 'Invalid payment signature' });

    const order = await Order.create({
      user: req.user._id,
      items: cartItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      orderStatus: 'confirmed'
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== COD ==========
router.post('/cod/place-order', protect, async (req, res) => {
  try {
    const { shippingAddress, cartItems, totalAmount } = req.body;
    const order = await Order.create({
      user: req.user._id,
      items: cartItems,
      totalAmount,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'placed'
    });

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
