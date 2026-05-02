import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './BarcodeView.css';
import './Admin.css';

export default function AllBarcodes() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get('/api/products?limit=200')
      .then(res => setProducts(res.data.products.filter(p => p.barcode)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    (p.barcode || '').includes(filter)
  );

  const openServerSheet = () => {
    window.open('http://localhost:5000/api/barcode/sheet', '_blank');
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container admin-page">
      <div className="admin-page-header">
        <div>
          <h1>🖨️ All Product Barcodes</h1>
          <p style={{ color: 'var(--text-muted)' }}>{filtered.length} products with barcodes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={openServerSheet}>🖨️ Print All</button>
          <Link to="/admin/products" className="btn btn-outline">← Back</Link>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input className="form-control" style={{ maxWidth: 340 }}
          placeholder="🔍 Search by name or barcode..."
          value={filter} onChange={e => setFilter(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p>No products with barcodes found.</p>
          <Link to="/admin/products/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>+ Add Product with Barcode</Link>
        </div>
      ) : (
        <div className="barcodes-print-grid">
          {filtered.map(product => {
            const finalPrice = product.price - (product.price * (product.discount || 0) / 100);
            return (
              <div key={product._id} className="barcode-print-card">
                <div className="bpc-name">{product.name}</div>
                {product.brand && <div className="bpc-brand">{product.brand}</div>}
                <div className="bpc-price">
                  ₹{finalPrice.toFixed(0)}
                  {product.discount > 0 && <span className="bpc-disc">-{product.discount}%</span>}
                </div>
                <img
                  src={`http://localhost:5000/api/barcode/image/${product.barcode}`}
                  alt={product.barcode}
                  className="bpc-barcode-img"
                  loading="lazy"
                />
                <div className="bpc-code">{product.barcode}</div>
                <div className="bpc-cat">{product.category}</div>
                <div className="bpc-actions no-print">
                  <Link to={`/admin/barcode/${product._id}`} className="bpc-action-btn">View</Link>
                  <Link to={`/admin/products/edit/${product._id}`} className="bpc-action-btn">Edit</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
