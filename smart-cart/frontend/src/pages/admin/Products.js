import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    const params = search ? `?search=${search}` : '';
    axios.get(`/api/products${params}&limit=50`)
      .then(res => setProducts(res.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await axios.put(`/api/products/${id}`, { isActive: !current });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, isActive: !current } : p));
      toast.success(current ? 'Product hidden' : 'Product visible');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-page-header">
        <div>
          <h1>📦 Products</h1>
          <p style={{color:'var(--text-muted)'}}>{products.length} products</p>
        </div>
        <Link to="/admin/products/add" className="btn btn-primary">+ Add Product</Link>
      </div>

      <div className="admin-search-bar">
        <input className="form-control" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchProducts()} />
        <button className="btn btn-primary" onClick={fetchProducts}>Search</button>
      </div>

      {loading ? <div className="loading">Loading...</div> : (
        <div className="card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Barcode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      {p.image
                        ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="table-thumb" />
                        : <span className="table-thumb-placeholder">🛍️</span>}
                    </td>
                    <td className="product-name-cell">{p.name}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price} {p.discount > 0 && <span className="discount-pct">-{p.discount}%</span>}</td>
                    <td className={p.stock < 5 ? 'low-stock' : ''}>{p.stock}</td>
                    <td><code className="barcode-text">{p.barcode || '—'}</code></td>
                    <td>
                      <button className={`toggle-btn ${p.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive(p._id, p.isActive)}>
                        {p.isActive ? '✅ Active' : '❌ Hidden'}
                      </button>
                    </td>
                    <td className="action-btns">
                      <Link to={`/admin/products/edit/${p._id}`} className="btn btn-outline btn-xs">Edit</Link>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p._id, p.name)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
