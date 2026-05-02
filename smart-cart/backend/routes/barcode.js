const express = require('express');
const router = express.Router();
const bwipjs = require('bwip-js');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Generate barcode image PNG for a product ───────────────
// GET /api/barcode/generate/:productId
// Returns a PNG image of the barcode
router.get('/generate/:productId', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.barcode) return res.status(400).json({ message: 'Product has no barcode. Add a barcode first.' });

    // Generate barcode PNG using bwip-js
    const png = await bwipjs.toBuffer({
      bcid: 'ean13',          // EAN-13 barcode type (standard retail)
      text: product.barcode,  // Barcode number
      scale: 3,               // 3x scale
      height: 20,             // Bar height in mm
      includetext: true,      // Show number below barcode
      textxalign: 'center',
      backgroundcolor: 'ffffff',
      barcolor: '000000',
    });

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `inline; filename="${product.barcode}.png"`);
    res.send(png);
  } catch (err) {
    // Try CODE128 if EAN-13 fails (barcode not 12 digits)
    try {
      const product = await Product.findById(req.params.productId);
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: product.barcode,
        scale: 3,
        height: 20,
        includetext: true,
        textxalign: 'center',
        backgroundcolor: 'ffffff',
      });
      res.set('Content-Type', 'image/png');
      res.send(png);
    } catch (e) {
      res.status(500).json({ message: 'Failed to generate barcode: ' + e.message });
    }
  }
});

// ─── Generate barcode from raw barcode string ────────────────
// GET /api/barcode/image/:barcodeText
// Public - used for display and printing
router.get('/image/:barcodeText', async (req, res) => {
  try {
    const text = req.params.barcodeText;

    // Decide format: EAN-13 needs exactly 12 digits (13th is checksum)
    const isEAN13 = /^\d{12,13}$/.test(text);
    const bcid = isEAN13 ? 'ean13' : 'code128';

    const png = await bwipjs.toBuffer({
      bcid,
      text,
      scale: 3,
      height: 22,
      includetext: true,
      textxalign: 'center',
      backgroundcolor: 'ffffff',
      barcolor: '000000',
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.send(png);
  } catch (err) {
    res.status(500).json({ message: 'Barcode generation failed: ' + err.message });
  }
});

// ─── Generate printable barcode sheet for ALL products ───────
// GET /api/barcode/sheet  (Admin only)
// Returns HTML page with all barcodes ready to print
router.get('/sheet', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, barcode: { $exists: true, $ne: '' } });

    const cards = products.map(p => `
      <div class="barcode-card">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${(p.price - p.price * (p.discount || 0) / 100).toFixed(0)}
          ${p.discount > 0 ? `<span class="disc">-${p.discount}%</span>` : ''}
        </div>
        <img src="http://localhost:5000/api/barcode/image/${p.barcode}" alt="${p.barcode}" class="barcode-img" />
        <div class="barcode-num">${p.barcode}</div>
        <div class="product-cat">${p.category}</div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>SmartCart Barcode Sheet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { text-align: center; margin-bottom: 6px; font-size: 22px; color: #111; }
    .subtitle { text-align: center; color: #666; margin-bottom: 20px; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .barcode-card {
      background: #fff; border: 1px solid #ddd; border-radius: 10px;
      padding: 14px; text-align: center; break-inside: avoid;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .product-name { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 4px; line-height: 1.3; }
    .product-price { font-size: 15px; font-weight: 800; color: #059669; margin-bottom: 10px; }
    .disc { background: #fef3c7; color: #d97706; font-size: 10px; padding: 1px 5px; border-radius: 4px; margin-left: 4px; }
    .barcode-img { max-width: 100%; height: auto; margin: 4px 0; }
    .barcode-num { font-family: monospace; font-size: 11px; color: #666; margin-top: 4px; }
    .product-cat { font-size: 10px; color: #999; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
    .print-btn { display: block; margin: 0 auto 20px; padding: 10px 30px; background: #059669; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; }
    @media print { .print-btn { display: none; } body { background: #fff; padding: 10px; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print All Barcodes</button>
  <h1>🛒 SmartCart — Product Barcodes</h1>
  <p class="subtitle">${products.length} products · Generated ${new Date().toLocaleString()}</p>
  <div class="grid">${cards}</div>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Lookup by barcode (scan result) ─────────────────────────
// GET /api/barcode/scan/:barcodeText
// Called by frontend after camera decodes a barcode
router.get('/scan/:barcodeText', protect, async (req, res) => {
  try {
    const barcode = req.params.barcodeText.trim();
    const product = await Product.findOne({
      barcode,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        found: false,
        message: `No product found for barcode: ${barcode}`
      });
    }

    const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

    res.json({
      found: true,
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        finalPrice,
        discount: product.discount,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        stock: product.stock,
        image: product.image,
        barcode: product.barcode,
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
