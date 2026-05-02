import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './BarcodeView.css';

export default function BarcodeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barcodeLoaded, setBarcodeLoaded] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/barcode/image/${product.barcode}`;
    link.download = `barcode_${product.barcode}.png`;
    link.click();
  };

  const openPrintSheet = () => {
    window.open('http://localhost:5000/api/barcode/sheet', '_blank');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="loading">Product not found</div>;

  const finalPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <div className="container barcode-page">

      {/* Success Banner */}
      <div className="success-banner">
        <span className="success-icon">✅</span>
        <div>
          <h2>Product Added Successfully!</h2>
          <p>Your barcode has been generated. Print or download it to use with the scanner.</p>
        </div>
      </div>

      <div className="barcode-layout">

        {/* Left — Barcode Display */}
        <div className="barcode-display-card" ref={printRef}>
          <div className="print-header">
            <span>🛒 SmartCart</span>
          </div>

          <h3 className="barcode-product-name">{product.name}</h3>
          {product.brand && <p className="barcode-brand">{product.brand}</p>}

          <div className="barcode-price-row">
            <span className="barcode-final-price">₹{finalPrice.toFixed(0)}</span>
            {product.discount > 0 && (
              <>
                <span className="barcode-orig-price">₹{product.price}</span>
                <span className="barcode-disc-badge">-{product.discount}%</span>
              </>
            )}
          </div>

          {/* Generated Barcode Image */}
          {product.barcode ? (
            <div className="barcode-image-wrap">
              {!barcodeLoaded && (
                <div className="barcode-loading">
                  <div className="barcode-skeleton" />
                  <p>Generating barcode...</p>
                </div>
              )}
              <img
                src={`http://localhost:5000/api/barcode/image/${product.barcode}`}
                alt={`Barcode ${product.barcode}`}
                className="barcode-img"
                style={{ display: barcodeLoaded ? 'block' : 'none' }}
                onLoad={() => setBarcodeLoaded(true)}
                onError={() => toast.error('Barcode image failed to load')}
              />
              <p className="barcode-number-text">{product.barcode}</p>
            </div>
          ) : (
            <div className="no-barcode-warn">
              ⚠️ No barcode assigned to this product.
              <Link to={`/admin/products/edit/${id}`} className="btn btn-outline" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Add Barcode
              </Link>
            </div>
          )}

          <div className="barcode-meta">
            <span>{product.category}</span>
            <span>•</span>
            <span>Stock: {product.stock} {product.unit}</span>
          </div>
        </div>

        {/* Right — Actions + Instructions */}
        <div className="barcode-actions-panel">

          <div className="card action-card">
            <h3>🖨️ Print & Download</h3>
            <div className="action-buttons">
              <button className="btn btn-primary action-btn" onClick={handlePrint} disabled={!barcodeLoaded}>
                🖨️ Print This Barcode
              </button>
              <button className="btn btn-outline action-btn" onClick={handleDownload} disabled={!barcodeLoaded || !product.barcode}>
                ⬇️ Download PNG
              </button>
              <button className="btn btn-outline action-btn" onClick={openPrintSheet}>
                📋 Print All Product Barcodes
              </button>
            </div>
          </div>

          <div className="card action-card">
            <h3>📷 How to Scan This Barcode</h3>
            <ol className="scan-steps">
              <li>
                <span className="step-num">1</span>
                <span>Print this barcode or show it on screen</span>
              </li>
              <li>
                <span className="step-num">2</span>
                <span>Login as a <strong>user</strong> (not admin)</span>
              </li>
              <li>
                <span className="step-num">3</span>
                <span>Go to <strong>Scanner</strong> page in the navbar</span>
              </li>
              <li>
                <span className="step-num">4</span>
                <span>Click <strong>Start Camera</strong></span>
              </li>
              <li>
                <span className="step-num">5</span>
                <span>Point your webcam at the barcode</span>
              </li>
              <li>
                <span className="step-num">6</span>
                <span>Product is found and added to cart automatically ✅</span>
              </li>
            </ol>
          </div>

          <div className="card action-card">
            <h3>📦 Product Details</h3>
            <table className="detail-table">
              <tbody>
                {[
                  ['Name', product.name],
                  ['Category', product.category],
                  ['Price', `₹${product.price}`],
                  ['Final Price', `₹${finalPrice.toFixed(2)}`],
                  ['Discount', product.discount > 0 ? `${product.discount}%` : 'None'],
                  ['Stock', `${product.stock} ${product.unit}`],
                  ['Brand', product.brand || '—'],
                  ['Barcode', product.barcode || '—'],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="detail-label">{label}</td>
                    <td className="detail-value">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="nav-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/admin/products/add')}>
              ➕ Add Another Product
            </button>
            <Link to="/admin/products" className="btn btn-outline">
              📦 View All Products
            </Link>
            <Link to="/admin/barcode/all" className="btn btn-outline">
              🖨️ Print All Barcodes
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
