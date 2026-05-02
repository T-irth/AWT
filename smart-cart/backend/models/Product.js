const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  barcode: { type: String, unique: true, sparse: true },  // For camera scan
  qrCode: { type: String },
  image: { type: String, default: '' },
  brand: { type: String },
  unit: { type: String, default: 'piece' },  // kg, litre, piece, etc.
  discount: { type: Number, default: 0 },    // Percentage
  isActive: { type: Boolean, default: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
