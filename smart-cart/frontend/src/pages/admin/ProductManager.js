import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

const CATEGORIES = [
  "Electronics","Groceries","Clothing","Books",
  "Home & Kitchen","Sports","Toys","Beauty","Automotive","Other"
];
const UNITS = ["piece","kg","gram","litre","ml","pack","dozen","box"];

// ── helpers ──────────────────────────────────────────────
function getToken() { return localStorage.getItem("sc_token") || ""; }
function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

// ── tiny toast ───────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };
  return { toasts, success: m => add(m, "success"), error: m => add(m, "error"), info: m => add(m, "info") };
}

// ═══════════════════════════════════════════════════════
export default function ProductManager() {
  const [screen, setScreen] = useState("login"); // login | list | form
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const toast = useToast();

  // ── login ──
  const [loginData, setLoginData] = useState({ email: "admin@demo.com", password: "admin123" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.role !== "admin") throw new Error("Admin access required");
      localStorage.setItem("sc_token", data.token);
      setUser(data);
      setScreen("list");
      toast.success(`Welcome, ${data.name}!`);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  // ── fetch products ──
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/products?limit=100`, { headers: authHeaders() });
      const data = await res.json();
      setProducts(data.products || []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (screen === "list") fetchProducts(); }, [screen]);

  // ── delete ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`${API}/products/${id}`, { method: "DELETE", headers: authHeaders() });
      setProducts(p => p.filter(x => x._id !== id));
      toast.success("Product deleted");
    } catch { toast.error("Delete failed"); }
  };

  // ── toggle active ──
  const toggleActive = async (id, current) => {
    try {
      await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !current })
      });
      setProducts(p => p.map(x => x._id === id ? { ...x, isActive: !current } : x));
    } catch { toast.error("Update failed"); }
  };

  // ── filtered list ──
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").includes(search);
    const matchCat = catFilter === "All" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const categories = ["All", ...new Set(products.map(p => p.category))];

  // ── screens ──
  if (screen === "login") return (
    <LoginScreen
      loginData={loginData} setLoginData={setLoginData}
      onLogin={handleLogin} loading={loading} toasts={toast.toasts}
    />
  );

  if (screen === "form") return (
    <ProductForm
      product={editProduct}
      onSave={() => { setScreen("list"); fetchProducts(); }}
      onCancel={() => setScreen("list")}
      toast={toast}
    />
  );

  return (
    <ListScreen
      user={user} products={filtered} allProducts={products}
      search={search} setSearch={setSearch}
      catFilter={catFilter} setCatFilter={setCatFilter}
      categories={categories}
      onAdd={() => { setEditProduct(null); setScreen("form"); }}
      onEdit={(p) => { setEditProduct(p); setScreen("form"); }}
      onDelete={handleDelete}
      onToggle={toggleActive}
      onLogout={() => { localStorage.removeItem("sc_token"); setUser(null); setScreen("login"); }}
      loading={loading}
      toasts={toast.toasts}
    />
  );
}

// ═══════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════
function LoginScreen({ loginData, setLoginData, onLogin, loading, toasts }) {
  return (
    <div style={s.page}>
      <Toasts toasts={toasts} />
      <div style={s.loginWrap}>
        <div style={s.loginCard}>
          <div style={s.loginLogo}>
            <span style={s.logoIcon}>🛒</span>
            <span style={s.logoText}>SmartCart</span>
          </div>
          <h2 style={s.loginTitle}>Admin Panel</h2>
          <p style={s.loginSub}>Sign in to manage your products</p>

          <form onSubmit={onLogin}>
            <Field label="Email Address">
              <input style={s.input} type="email" value={loginData.email}
                onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="admin@demo.com" required />
            </Field>
            <Field label="Password">
              <input style={s.input} type="password" value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="••••••••" required />
            </Field>
            <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", marginTop: 8 }}
              type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={s.demoBox}>
            <span style={{ color: "#64748b", fontSize: 12 }}>Demo credentials</span>
            <code style={s.demoCode}>admin@demo.com / admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// LIST SCREEN
// ═══════════════════════════════════════════════════════
function ListScreen({ user, products, allProducts, search, setSearch, catFilter, setCatFilter,
  categories, onAdd, onEdit, onDelete, onToggle, onLogout, loading, toasts }) {

  const stats = {
    total: allProducts.length,
    active: allProducts.filter(p => p.isActive).length,
    lowStock: allProducts.filter(p => p.stock < 10).length,
    categories: new Set(allProducts.map(p => p.category)).size,
  };

  return (
    <div style={s.page}>
      <Toasts toasts={toasts} />

      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#10b981", fontFamily: "'Syne', sans-serif" }}>
            🛒 SmartCart
          </span>
          <span style={s.headerSep} />
          <span style={{ color: "#94a3b8", fontSize: 14 }}>Product Manager</span>
        </div>
        <div style={s.headerRight}>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>👤 {user?.name}</span>
          <button style={{ ...s.btn, ...s.btnOutline, padding: "6px 14px", fontSize: 13 }} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={s.container}>

        {/* Stats Row */}
        <div style={s.statsRow}>
          {[
            { label: "Total Products", value: stats.total, icon: "📦", color: "#10b981" },
            { label: "Active", value: stats.active, icon: "✅", color: "#3b82f6" },
            { label: "Low Stock", value: stats.lowStock, icon: "⚠️", color: "#f59e0b" },
            { label: "Categories", value: stats.categories, icon: "🏷️", color: "#8b5cf6" },
          ].map((s2, i) => (
            <div key={i} style={s.statCard}>
              <span style={{ fontSize: 28 }}>{s2.icon}</span>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s2.color, fontFamily: "'Syne',sans-serif" }}>{s2.value}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s2.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarLeft}>
            <input style={{ ...s.input, width: 260, margin: 0 }}
              placeholder="🔍  Search by name or barcode..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <div style={s.catTabs}>
              {categories.map(c => (
                <button key={c}
                  style={{ ...s.catTab, ...(catFilter === c ? s.catTabActive : {}) }}
                  onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
          </div>
          <button style={{ ...s.btn, ...s.btnPrimary, gap: 8, whiteSpace: "nowrap" }} onClick={onAdd}>
            + Add Product
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={s.emptyState}><span style={{ fontSize: 40 }}>⏳</span><p>Loading products...</p></div>
        ) : products.length === 0 ? (
          <div style={s.emptyState}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p style={{ color: "#94a3b8", marginTop: 12 }}>No products found</p>
            <button style={{ ...s.btn, ...s.btnPrimary, marginTop: 16 }} onClick={onAdd}>+ Add First Product</button>
          </div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {["Image","Product Name","Category","Price","Stock","Barcode","Status","Actions"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => {
                  const finalPrice = p.price - (p.price * (p.discount || 0) / 100);
                  return (
                    <tr key={p._id} style={{ ...s.tr, background: i % 2 === 0 ? "#0f172a" : "#111827" }}>
                      <td style={s.td}>
                        {p.image
                          ? <img src={`http://localhost:5000${p.image}`} alt={p.name} style={s.thumb} />
                          : <div style={s.thumbPlaceholder}>🛍️</div>}
                      </td>
                      <td style={{ ...s.td, maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{p.name}</div>
                        {p.brand && <div style={{ color: "#64748b", fontSize: 12 }}>{p.brand}</div>}
                        {p.discount > 0 && <span style={s.discBadge}>-{p.discount}%</span>}
                      </td>
                      <td style={s.td}><span style={s.catBadge}>{p.category}</span></td>
                      <td style={s.td}>
                        <div style={{ color: "#10b981", fontWeight: 700 }}>₹{finalPrice.toFixed(0)}</div>
                        {p.discount > 0 && <div style={{ color: "#475569", fontSize: 12, textDecoration: "line-through" }}>₹{p.price}</div>}
                      </td>
                      <td style={s.td}>
                        <span style={{ color: p.stock < 10 ? "#ef4444" : p.stock < 20 ? "#f59e0b" : "#10b981", fontWeight: 700 }}>
                          {p.stock}
                        </span>
                        <div style={{ color: "#475569", fontSize: 11 }}>{p.unit}</div>
                      </td>
                      <td style={s.td}>
                        <code style={s.barcodeText}>{p.barcode || "—"}</code>
                      </td>
                      <td style={s.td}>
                        <button
                          style={{ ...s.toggleBtn, background: p.isActive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: p.isActive ? "#10b981" : "#ef4444" }}
                          onClick={() => onToggle(p._id, p.isActive)}>
                          {p.isActive ? "● Active" : "○ Hidden"}
                        </button>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={{ ...s.btn, ...s.btnOutline, padding: "5px 12px", fontSize: 12 }}
                            onClick={() => onEdit(p)}>✏️ Edit</button>
                          <button style={{ ...s.btn, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", padding: "5px 12px", fontSize: 12 }}
                            onClick={() => onDelete(p._id, p.name)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PRODUCT FORM SCREEN
// ═══════════════════════════════════════════════════════
function ProductForm({ product, onSave, onCancel, toast }) {
  const isEdit = !!product;
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || "");
  const [category, setCategory] = useState(product?.category || "");
  const [stock, setStock] = useState(product?.stock ?? "");
  const [barcode, setBarcode] = useState(product?.barcode || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [unit, setUnit] = useState(product?.unit || "piece");
  const [discount, setDiscount] = useState(product?.discount ?? 0);
  const [isActive, setIsActive] = useState(product?.isActive !== false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image ? `http://localhost:5000${product.image}` : "");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => () => stopCamera(), []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Required";
    if (!description.trim()) e.description = "Required";
    if (!price || Number(price) <= 0) e.price = "Enter valid price";
    if (!category) e.category = "Select category";
    if (stock === "" || Number(stock) < 0) e.stock = "Enter valid stock";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
    } catch { toast.error("Camera access denied"); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const takePicture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      setImageFile(file);
      setPreview(URL.createObjectURL(blob));
      toast.success("Photo captured!");
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error("Please fix errors"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("price", price);
      fd.append("category", category);
      fd.append("stock", stock);
      fd.append("barcode", barcode.trim());
      fd.append("brand", brand.trim());
      fd.append("unit", unit);
      fd.append("discount", discount || 0);
      fd.append("isActive", isActive);
      if (imageFile) fd.append("image", imageFile);

      const url = isEdit ? `${API}/products/${product._id}` : `${API}/products`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      toast.success(isEdit ? "Product updated!" : "Product added!");
      onSave();
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  const finalPrice = price && discount ? (price - price * discount / 100).toFixed(2) : price;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerLeft}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#10b981", fontFamily: "'Syne',sans-serif" }}>🛒 SmartCart</span>
          <span style={s.headerSep} />
          <span style={{ color: "#94a3b8", fontSize: 14 }}>{isEdit ? "Edit Product" : "Add New Product"}</span>
        </div>
        <button style={{ ...s.btn, ...s.btnOutline }} onClick={onCancel}>← Back to List</button>
      </header>

      <div style={{ ...s.container, maxWidth: 960 }}>
        <div style={s.formGrid}>

          {/* LEFT */}
          <div>
            {/* Image Card */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>🖼️ Product Image</h3>
              {!cameraOpen ? (
                <>
                  <div style={s.imageBox}>
                    {preview
                      ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                      : <div style={s.imagePlaceholder}><span style={{ fontSize: 40 }}>🛍️</span><p style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>No image</p></div>}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <label style={{ ...s.btn, ...s.btnOutline, cursor: "pointer", fontSize: 13 }}>
                      📁 Choose File
                      <input type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setPreview(URL.createObjectURL(f)); } }} />
                    </label>
                    <button type="button" style={{ ...s.btn, ...s.btnPrimary, fontSize: 13 }} onClick={openCamera}>📷 Camera</button>
                    {preview && <button type="button" style={{ ...s.btn, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13 }}
                      onClick={() => { setPreview(""); setImageFile(null); }}>🗑 Remove</button>}
                  </div>
                </>
              ) : (
                <div>
                  <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", borderRadius: 10, background: "#000", maxHeight: 260, objectFit: "cover" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button type="button" style={{ ...s.btn, ...s.btnPrimary }} onClick={takePicture}>📸 Capture</button>
                    <button type="button" style={{ ...s.btn, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }} onClick={stopCamera}>✕ Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Preview */}
            {price > 0 && (
              <div style={{ ...s.card, marginTop: 16, background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))", border: "1px solid rgba(16,185,129,0.2)" }}>
                <h3 style={s.cardTitle}>💰 Price Preview</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#10b981", fontFamily: "'Syne',sans-serif" }}>₹{finalPrice}</span>
                  {discount > 0 && <span style={{ color: "#475569", textDecoration: "line-through", fontSize: 18 }}>₹{price}</span>}
                  {discount > 0 && <span style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>-{discount}% OFF</span>}
                </div>
                {stock > 0 && <div style={{ color: "#10b981", fontSize: 13, marginTop: 6 }}>✅ {stock} {unit}s in stock</div>}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div>
            <form onSubmit={handleSubmit}>
              <div style={s.card}>
                <h3 style={s.cardTitle}>📋 Product Details</h3>

                <FormField label="Product Name" required error={errors.name}>
                  <input style={{ ...s.input, ...(errors.name ? s.inputError : {}) }}
                    placeholder="e.g. Amul Butter 500g" value={name} onChange={e => setName(e.target.value)} />
                </FormField>

                <FormField label="Description" required error={errors.description}>
                  <textarea style={{ ...s.input, height: 90, resize: "vertical", ...(errors.description ? s.inputError : {}) }}
                    placeholder="Short product description..." value={description} onChange={e => setDescription(e.target.value)} />
                </FormField>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Category" required error={errors.category}>
                    <select style={{ ...s.input, ...(errors.category ? s.inputError : {}) }}
                      value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="">-- Select --</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Brand">
                    <input style={s.input} placeholder="e.g. Amul" value={brand} onChange={e => setBrand(e.target.value)} />
                  </FormField>
                  <FormField label="Price (₹)" required error={errors.price}>
                    <input style={{ ...s.input, ...(errors.price ? s.inputError : {}) }}
                      type="number" min="0.01" step="0.01" placeholder="299" value={price} onChange={e => setPrice(e.target.value)} />
                  </FormField>
                  <FormField label="Discount (%)">
                    <input style={s.input} type="number" min="0" max="100" placeholder="0"
                      value={discount} onChange={e => setDiscount(e.target.value)} />
                  </FormField>
                  <FormField label="Stock Qty" required error={errors.stock}>
                    <input style={{ ...s.input, ...(errors.stock ? s.inputError : {}) }}
                      type="number" min="0" placeholder="50" value={stock} onChange={e => setStock(e.target.value)} />
                  </FormField>
                  <FormField label="Unit">
                    <select style={s.input} value={unit} onChange={e => setUnit(e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </FormField>
                </div>

                <FormField label="Barcode" hint="Used by camera scanner to identify product">
                  <input style={{ ...s.input, fontFamily: "monospace", letterSpacing: "0.06em" }}
                    placeholder="e.g. 8901030007765" value={barcode} onChange={e => setBarcode(e.target.value)} />
                </FormField>

                {isEdit && (
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 4 }}>
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#10b981" }} />
                    <span style={{ color: "#94a3b8", fontSize: 14 }}>Visible to customers</span>
                  </label>
                )}
              </div>

              <button style={{ ...s.btn, ...s.btnPrimary, width: "100%", padding: "14px", fontSize: 16, marginTop: 16, justifyContent: "center" }}
                type="submit" disabled={saving}>
                {saving
                  ? <><Spinner /> {isEdit ? "Updating..." : "Adding..."}</>
                  : isEdit ? "✅ Update Product" : "✅ Add Product"}
              </button>
              <p style={{ color: "#475569", fontSize: 12, textAlign: "center", marginTop: 8 }}>
                <span style={{ color: "#ef4444" }}>*</span> Required fields
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── small components ──────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  );
}

function FormField({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={s.label}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {error && <span style={{ color: "#ef4444", fontSize: 11, marginTop: 3, display: "block" }}>{error}</span>}
      {hint && <span style={{ color: "#475569", fontSize: 11, marginTop: 3, display: "block" }}>ℹ️ {hint}</span>}
    </div>
  );
}

function Spinner() {
  return <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 8 }} />;
}

function Toasts({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "success" ? "#052e16" : t.type === "error" ? "#1c0a09" : "#0c1a2e",
          border: `1px solid ${t.type === "success" ? "#16a34a" : t.type === "error" ? "#dc2626" : "#2563eb"}`,
          color: t.type === "success" ? "#4ade80" : t.type === "error" ? "#f87171" : "#60a5fa",
          padding: "10px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)", animation: "slideIn 0.3s ease", maxWidth: 320
        }}>
          {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"} {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── styles ────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#060b14", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" },
  container: { maxWidth: 1300, margin: "0 auto", padding: "24px 20px" },

  header: { background: "rgba(6,11,20,0.95)", borderBottom: "1px solid #1e293b", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerSep: { width: 1, height: 20, background: "#1e293b" },

  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 60%)" },
  loginCard: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420 },
  loginLogo: { display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 20 },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 24, fontWeight: 800, color: "#10b981", fontFamily: "'Syne',sans-serif" },
  loginTitle: { fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Syne',sans-serif" },
  loginSub: { color: "#64748b", fontSize: 14, textAlign: "center", marginBottom: 24 },
  demoBox: { background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", marginTop: 20, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" },
  demoCode: { background: "#111827", padding: "4px 10px", borderRadius: 6, fontSize: 12, color: "#10b981", fontFamily: "monospace" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 },
  statCard: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 },

  toolbar: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" },
  toolbarLeft: { display: "flex", flexDirection: "column", gap: 10, flex: 1 },
  catTabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  catTab: { background: "transparent", border: "1px solid #1e293b", borderRadius: 20, padding: "4px 14px", color: "#64748b", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" },
  catTabActive: { background: "#10b981", borderColor: "#10b981", color: "#fff", fontWeight: 600 },

  tableWrap: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14, overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 14px", textAlign: "left", color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #1e293b", whiteSpace: "nowrap" },
  tr: { transition: "background 0.1s" },
  td: { padding: "12px 14px", borderBottom: "1px solid #0f172a", verticalAlign: "middle" },
  thumb: { width: 46, height: 46, borderRadius: 8, objectFit: "cover" },
  thumbPlaceholder: { width: 46, height: 46, borderRadius: 8, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 },
  catBadge: { background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  discBadge: { background: "rgba(245,158,11,0.12)", color: "#f59e0b", padding: "2px 7px", borderRadius: 6, fontSize: 11, fontWeight: 700, marginLeft: 6 },
  barcodeText: { fontFamily: "monospace", fontSize: 12, color: "#64748b", background: "#111827", padding: "3px 8px", borderRadius: 6 },
  toggleBtn: { border: "none", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" },

  emptyState: { textAlign: "center", padding: "60px 20px", color: "#475569" },

  card: { background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14, padding: 20, marginBottom: 0 },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#94a3b8", borderBottom: "1px solid #1e293b", paddingBottom: 10, fontFamily: "'Syne',sans-serif" },

  formGrid: { display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" },

  imageBox: { width: "100%", aspectRatio: "1", background: "#111827", borderRadius: 12, overflow: "hidden", border: "2px dashed #1e293b", display: "flex", alignItems: "center", justifyContent: "center" },
  imagePlaceholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },

  label: { display: "block", marginBottom: 5, color: "#64748b", fontSize: 13, fontWeight: 500 },
  input: { width: "100%", padding: "10px 14px", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", outline: "none" },
  inputError: { borderColor: "#ef4444" },

  btn: { display: "inline-flex", alignItems: "center", padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.15s" },
  btnPrimary: { background: "#10b981", color: "#fff" },
  btnOutline: { background: "transparent", border: "1px solid #1e293b", color: "#94a3b8" },
};

// inject keyframes
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #060b14; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    input:focus, select:focus, textarea:focus { border-color: #10b981 !important; }
    button:hover { opacity: 0.88; }
    tr:hover td { background: rgba(16,185,129,0.03) !important; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0d1117; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
    @media (max-width: 900px) {
      .form-grid { grid-template-columns: 1fr !important; }
      .stats-row { grid-template-columns: 1fr 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}
