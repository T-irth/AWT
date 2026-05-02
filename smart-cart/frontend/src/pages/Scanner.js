import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Scanner.css';

// Scan history stored in session
const MAX_HISTORY = 10;

export default function Scanner() {
  const html5QrCodeRef = useRef(null);
  const isScanningRef = useRef(false);
  const detectedRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false); // image processing state
  const [scannedProduct, setScannedProduct] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState([]); // recently scanned
  const [quantity, setQuantity] = useState(1);
  const [lastBarcode, setLastBarcode] = useState('');
  const [camError, setCamError] = useState('');

  const { addToCart } = useCart();

  useEffect(() => { return () => safeStop(); }, []);

  // ── Camera controls ────────────────────────────────────────
  const safeStop = async () => {
    if (html5QrCodeRef.current && isScanningRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch (_) {}
      try { await html5QrCodeRef.current.clear(); } catch (_) {}
    }
    isScanningRef.current = false;
    html5QrCodeRef.current = null;
    setScanning(false);
  };

  const startScanner = async () => {
    setCamError('');
    detectedRef.current = false;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      const config = { fps: 12, qrbox: { width: 280, height: 160 } };
      const onSuccess = (text) => handleBarcodeDetected(text);
      const onError = () => {};
      try {
        await html5QrCodeRef.current.start({ facingMode: 'environment' }, config, onSuccess, onError);
      } catch {
        await html5QrCodeRef.current.start({ facingMode: 'user' }, config, onSuccess, onError);
      }
      isScanningRef.current = true;
      setScanning(true);
    } catch (e) {
      setCamError('Camera access denied. Please allow camera permission in your browser.');
      setScanning(false);
    }
  };

  // ── Core: barcode detected → image processing → DB lookup ──
  const handleBarcodeDetected = useCallback(async (barcode) => {
    if (detectedRef.current) return;
    detectedRef.current = true;

    await safeStop();
    setLastBarcode(barcode);
    await processBarcode(barcode);
  }, []);

  const processBarcode = async (barcode) => {
    setProcessing(true);
    setScannedProduct(null);
    setQuantity(1);

    try {
      // Step 1: Image processing — decode & validate barcode string
      const cleaned = barcode.trim().replace(/\s+/g, '');
      if (!cleaned) throw new Error('Invalid barcode detected');

      // Step 2: Lookup in database
      const { data } = await axios.get(`/api/barcode/scan/${cleaned}`);

      if (!data.found) throw new Error(data.message);

      setScannedProduct(data.product);

      // Step 3: Add to scan history
      setScanHistory(prev => {
        const existing = prev.find(h => h.barcode === cleaned);
        if (existing) return prev; // don't duplicate
        const newEntry = { barcode: cleaned, name: data.product.name, time: new Date().toLocaleTimeString(), product: data.product };
        return [newEntry, ...prev].slice(0, MAX_HISTORY);
      });

      toast.success(`✅ Found: ${data.product.name}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Product not found';
      toast.error(`❌ ${msg}`);
      setScannedProduct(null);
    } finally {
      setProcessing(false);
    }
  };

  // ── Add to cart ────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!scannedProduct) return;
    await addToCart(scannedProduct._id, quantity);
    // Keep product visible, just reset qty
    setQuantity(1);
  };

  const handleScanAnother = () => {
    setScannedProduct(null);
    setManualBarcode('');
    setLastBarcode('');
    detectedRef.current = false;
    setQuantity(1);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) processBarcode(manualBarcode.trim());
  };

  const handleHistoryClick = (barcode) => {
    processBarcode(barcode);
  };

  const finalPrice = scannedProduct
    ? (scannedProduct.price - scannedProduct.price * (scannedProduct.discount || 0) / 100)
    : 0;

  return (
    <div className="container scanner-page">
      <div className="page-header">
        <h1>📷 Barcode Scanner</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Scan a product barcode with your camera — it will be found and added to your cart instantly
        </p>
      </div>

      {/* Processing overlay */}
      {processing && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="processing-spinner" />
            <p className="processing-text">Processing barcode image...</p>
            {lastBarcode && <code className="processing-code">{lastBarcode}</code>}
          </div>
        </div>
      )}

      <div className="scanner-main-grid">

        {/* ── Camera Section ── */}
        <div className="card scanner-card">
          <div className="scanner-card-header">
            <h3>📷 Camera Scanner</h3>
            <span className={`scan-status-dot ${scanning ? 'active' : ''}`} />
          </div>
          <p className="scanner-hint">Point your laptop webcam at any product barcode</p>

          {/* Camera viewport — #qr-reader is owned by html5-qrcode, NO React children inside */}
          <div className={`scanner-viewport-wrap ${scanning ? 'active' : ''}`}>
            <div id="qr-reader" style={{ width: '100%' }} />
            {!scanning && !processing && (
              <div className="scanner-idle-overlay">
                <div className="scanner-idle-icon">📷</div>
                <p>Camera not active</p>
                <span>Click Start Camera to begin</span>
              </div>
            )}
          </div>

          {camError && (
            <div className="cam-error">
              ⚠️ {camError}
            </div>
          )}

          <div className="scanner-controls">
            {!scanning ? (
              <button className="btn btn-primary" onClick={startScanner} disabled={processing}>
                📷 Start Camera
              </button>
            ) : (
              <button className="btn btn-danger" onClick={safeStop}>
                ⏹ Stop Camera
              </button>
            )}
            {(scannedProduct || lastBarcode) && (
              <button className="btn btn-outline" onClick={handleScanAnother}>
                🔄 Scan Another
              </button>
            )}
          </div>

          {scanning && (
            <div className="scanning-status">
              <span className="pulse-dot" /> Scanning — point camera at barcode...
            </div>
          )}
        </div>

        {/* ── Result + Manual Entry Section ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Manual Barcode Entry */}
          <div className="card scanner-card">
            <h3>⌨️ Manual Entry</h3>
            <p className="scanner-hint">Type or paste a barcode number manually</p>
            <form onSubmit={handleManualSearch} className="manual-form">
              <input
                className="form-control barcode-input"
                placeholder="e.g. 8901030007765"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
              />
              <button className="btn btn-primary" type="submit" disabled={processing || !manualBarcode.trim()}>
                {processing ? '⏳ Searching...' : '🔍 Lookup'}
              </button>
            </form>
          </div>

          {/* Scanned Product Result */}
          {scannedProduct && (
            <div className="scanned-result-card card">
              <div className="result-found-header">
                <span className="result-check">✅</span>
                <span>Product Found!</span>
              </div>

              <div className="result-product-row">
                <div className="result-image">
                  {scannedProduct.image
                    ? <img src={`http://localhost:5000${scannedProduct.image}`} alt={scannedProduct.name} />
                    : <div className="result-img-placeholder">🛍️</div>
                  }
                </div>
                <div className="result-info">
                  <h4>{scannedProduct.name}</h4>
                  <span className="result-category">{scannedProduct.category}</span>
                  {scannedProduct.brand && <span className="result-brand">{scannedProduct.brand}</span>}
                  <div className="result-price-row">
                    <span className="result-price">₹{finalPrice.toFixed(2)}</span>
                    {scannedProduct.discount > 0 && (
                      <>
                        <span className="result-orig">₹{scannedProduct.price}</span>
                        <span className="result-disc">-{scannedProduct.discount}%</span>
                      </>
                    )}
                  </div>
                  <div className={scannedProduct.stock > 0 ? 'result-instock' : 'result-outstock'}>
                    {scannedProduct.stock > 0 ? `✅ ${scannedProduct.stock} in stock` : '❌ Out of Stock'}
                  </div>
                  <code className="result-barcode">{scannedProduct.barcode}</code>
                </div>
              </div>

              {scannedProduct.stock > 0 && (
                <div className="result-add-row">
                  <div className="qty-control">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(scannedProduct.stock, q + 1))}>+</button>
                  </div>
                  <button className="btn btn-primary result-add-btn" onClick={handleAddToCart}>
                    🛒 Add {quantity > 1 ? `${quantity}x ` : ''}to Cart
                  </button>
                </div>
              )}

              <div className="result-footer">
                <Link to={`/products/${scannedProduct._id}`} className="result-link">View Details →</Link>
                <button className="result-link-btn" onClick={handleScanAnother}>Scan Another</button>
              </div>
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="card scanner-card">
              <h3>🕒 Recent Scans</h3>
              <div className="scan-history-list">
                {scanHistory.map((h, i) => (
                  <div key={i} className="history-item" onClick={() => handleHistoryClick(h.barcode)}>
                    <div className="history-item-info">
                      <span className="history-name">{h.name}</span>
                      <code className="history-barcode">{h.barcode}</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="history-time">{h.time}</span>
                      <button className="btn btn-outline btn-xs history-add-btn"
                        onClick={e => { e.stopPropagation(); addToCart(h.product._id, 1); }}>
                        + Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card scanner-tips">
        <h3>💡 Scanning Tips</h3>
        <ul>
          <li>Ensure the barcode is well-lit and clearly visible</li>
          <li>Keep the barcode within the green scanning box</li>
          <li>Hold the product steady — avoid motion blur</li>
          <li>On laptops: bring product close to the webcam (15–30cm)</li>
          <li>If scan fails, use manual entry with the barcode number</li>
          <li>Supported: EAN-13, EAN-8, CODE-128, QR Code</li>
        </ul>
      </div>
    </div>
  );
}
