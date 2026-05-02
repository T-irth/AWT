import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    axios.get('/api/products/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    axios.get(`/api/products?${params}`)
      .then(res => { setProducts(res.data.products); setTotal(res.data.total); })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => { prev.set('search', searchInput); prev.set('page', '1'); return prev; });
  };

  const setCategory = (cat) => {
    setSearchParams(prev => { 
      if (cat) prev.set('category', cat); else prev.delete('category');
      prev.set('page', '1'); return prev;
    });
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>All Products</h1>
        <p style={{color:'var(--text-muted)'}}>
          {total} product{total !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input className="form-control" placeholder="Search products..." value={searchInput}
          onChange={e => setSearchInput(e.target.value)} />
        <button className="btn btn-primary" type="submit">Search</button>
        {search && <button className="btn btn-outline" type="button" onClick={() => { setSearchInput(''); setSearchParams(prev => { prev.delete('search'); return prev; }); }}>Clear</button>}
      </form>

      {/* Category Filter */}
      <div className="category-filter">
        <button className={`filter-btn ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>All</button>
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div style={{fontSize:'3rem'}}>🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid-products">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
