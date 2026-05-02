import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Admin.css';

const CATEGORIES = [
  'Electronics', 'Groceries', 'Clothing', 'Books',
  'Home & Kitchen', 'Sports', 'Toys', 'Beauty', 'Automotive', 'Other'
];
const UNITS = ['piece', 'kg', 'gram', 'litre', 'ml', 'pack', 'dozen', 'box'];

export default function AddProduct() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [unit, setUnit] = useState('piece');
  const [discount, setDiscount] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      axios.get(`/api/products/${id}`)
        .then(res => {
          const p = res.data;
          setName(p.name || '');
          setDescription(p.description || '');
          setPrice(String(p.price || ''));
          setCategory(p.category || '');
          setStock(String(p.stock || ''));
          setBarcode(p.barcode || '');
          setBrand(p.brand || '');
          setUnit(p.unit || 'piece');
          setDiscount(String(p.discount || '0'));
          setIsActive(p.isActive !== false);
          if (p.image) setPreview(`http://localhost:5000${p.image}`);
        })
        .catch(() => toast.error('Failed to load product'));
    }
  }, [id, isEdit]);

  useEffect(() => { return () => stopCamera(); }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Product name is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!price || isNaN(price) || Number(price) <= 0) e.price = 'Enter a valid price';
    if (!category) e.category = 'Please select a category';
    if (stock === '' || isNaN(stock) || Number(stock) < 0) e.stock = 'Enter a valid stock quantity';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error('Camera access denied. Please allow camera in browser settings.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const takePicture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) { toast.error('Failed to capture image'); return; }
      const file = new File([blob], `product_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImage(file);
      setPreview(URL.createObjectURL(blob));
      toast.success('Photo captured!');
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stock', stock);
      formData.append('barcode', barcode.trim());
      formData.append('brand', brand.trim());
      formData.append('unit', unit);
      formData.append('discount', discount || '0');
      formData.append('isActive', isActive);
      if (image) formData.append('image', image);

      if (isEdit) {
        await axios.put(`/api/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully!');
        navigate('/admin/products');
      } else {
        const { data } = await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added successfully!');
        // Go to barcode view page for the new product
        navigate(`/admin/barcode/${data._id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product. Check your connection.';
      toast.error(msg);
      console.error('Product save error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container admin-page">
      <div className="admin-page-header">
        <div>
          <h1>{isEdit ? '✏️ Edit Product' : '➕ Add New Product'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {isEdit ? 'Update product information' : 'Fill in the details to add a new product'}
          </p>
        </div>
        <button className="btn btn-outline" type="button" onClick={() => navigate('/admin/products')}>
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="add-product-grid">

          {/* LEFT COLUMN */}
          <div>

            {/* Image Upload */}
            <div className="card form-section">
              <h3>🖼️ Product Image</h3>
              {!cameraOpen ? (
                <>
                  <div className="image-preview-box">
                    {preview
                      ? <img src={preview} alt="Preview" className="img-preview" />
                      : <div className="img-placeholder"><span>🛍️</span><p>No image selected</p></div>
                    }
                  </div>
                  <div className="image-action-btns">
                    <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                      📁 Choose File
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                    <button type="button" className="btn btn-primary" onClick={openCamera}>
                      📷 Camera
                    </button>
                    {preview && (
                      <button type="button" className="btn btn-danger" onClick={() => { setPreview(''); setImage(null); }}>
                        🗑 Remove
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="live-camera-wrap">
                  <video ref={videoRef} autoPlay muted playsInline className="live-video" />
                  <div className="camera-action-btns">
                    <button type="button" className="btn btn-primary" onClick={takePicture}>📸 Capture</button>
                    <button type="button" className="btn btn-danger" onClick={stopCamera}>✕ Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="card form-section">
              <h3>💰 Pricing & Stock</h3>

              <div className="form-group">
                <label>Price (₹) <span className="required">*</span></label>
                <input className={`form-control ${errors.price ? 'input-error' : ''}`}
                  type="number" min="0.01" step="0.01" placeholder="e.g. 299"
                  value={price} onChange={e => setPrice(e.target.value)} />
                {errors.price && <span className="error-msg">{errors.price}</span>}
              </div>

              <div className="form-group">
                <label>Discount (%)</label>
                <input className="form-control" type="number" min="0" max="100" placeholder="0"
                  value={discount} onChange={e => setDiscount(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Stock Quantity <span className="required">*</span></label>
                <input className={`form-control ${errors.stock ? 'input-error' : ''}`}
                  type="number" min="0" placeholder="e.g. 50"
                  value={stock} onChange={e => setStock(e.target.value)} />
                {errors.stock && <span className="error-msg">{errors.stock}</span>}
              </div>

              <div className="form-group">
                <label>Unit</label>
                <select className="form-control" value={unit} onChange={e => setUnit(e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div className="card form-section">
              <h3>📋 Product Details</h3>

              <div className="form-group">
                <label>Product Name <span className="required">*</span></label>
                <input className={`form-control ${errors.name ? 'input-error' : ''}`}
                  type="text" placeholder="e.g. Amul Butter 500g"
                  value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea className={`form-control ${errors.description ? 'input-error' : ''}`}
                  rows={4} placeholder="Write a short product description..."
                  value={description} onChange={e => setDescription(e.target.value)} />
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label>Category <span className="required">*</span></label>
                <select className={`form-control ${errors.category ? 'input-error' : ''}`}
                  value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">-- Select a Category --</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <span className="error-msg">{errors.category}</span>}
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input className="form-control" type="text" placeholder="e.g. Amul"
                  value={brand} onChange={e => setBrand(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Barcode <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(for camera scan)</span></label>
                <input className="form-control" type="text" placeholder="e.g. 8901030007765"
                  value={barcode} onChange={e => setBarcode(e.target.value)}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }} />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                  Users scan this barcode with their camera to add product to cart
                </small>
              </div>

              {isEdit && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                    <span>Product visible to customers</span>
                  </label>
                </div>
              )}
            </div>

            <button className="btn btn-primary submit-product-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="spinner" /> {isEdit ? 'Updating...' : 'Adding Product...'}</>
                : isEdit ? '✅ Update Product' : '✅ Add Product'
              }
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.75rem' }}>
              <span className="required">*</span> Required fields
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
