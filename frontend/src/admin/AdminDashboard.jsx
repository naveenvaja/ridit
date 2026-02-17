import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "styles/Admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("users"); // users, items, subscriptions
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", referred_by: "" });
  const [createForm, setCreateForm] = useState({ name: "", email: "", phone: "", password: "", user_type: "seller" });
  const [editingItemWeight, setEditingItemWeight] = useState(null);
  const [editingItemWeightValue, setEditingItemWeightValue] = useState("");
  const [loadingItemUpdate, setLoadingItemUpdate] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const userType = localStorage.getItem("user_type");
    const token = localStorage.getItem("token");
    if (userType !== "admin" || !token) {
      navigate("/admin/login");
      return;
    }

    fetchUsers();
    fetchItems();
    fetchSubscriptions();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setUsers(Object.values(data || {}));
      setError("");
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/items`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setItems(Object.values(data || {}));
      setError("");
    } catch (err) {
      setError(`Failed to fetch items: ${err.message}`);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/subscriptions`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(`Failed to fetch subscriptions: ${err.message}`);
    }
  };

  const activateSubscription = async (collectorId) => {
    const days = prompt("Enter days valid (default 30):", "30");
    if (days === null) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/subscriptions/${collectorId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ collector_id: collectorId, plan_type: "basic", days_valid: parseInt(days) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setError("");
      await fetchSubscriptions();
    } catch (err) {
      setError(`Failed to activate subscription: ${err.message}`);
    }
  };

  const cancelSubscription = async (collectorId) => {
    if (!window.confirm("Cancel this subscription?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/subscriptions/${collectorId}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setError("");
      await fetchSubscriptions();
    } catch (err) {
      setError(`Failed to cancel subscription: ${err.message}`);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/user/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setError("");
      await fetchUsers();
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    }
  };

  const openSettings = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name || "", phone: user.phone || "", referred_by: user.referred_by || "" });
    setShowEditUser(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/user/${editUser.id || editUser}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      setShowEditUser(false);
      setEditUser(null);
      setError("");
      await fetchUsers();
      alert('User updated successfully');
    } catch (err) {
      setError(`Failed to update user: ${err.message}`);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/item/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setError("");
      await fetchItems();
    } catch (err) {
      setError(`Failed to delete item: ${err.message}`);
    }
  };

  const handleEditItemWeight = (item) => {
    setEditingItemWeight(item);
    setEditingItemWeightValue(item.actual_weight || "");
  };

  const handleUpdateItemWeight = async () => {
    if (!editingItemWeight || !editingItemWeightValue || parseFloat(editingItemWeightValue) <= 0) {
      setError("Please enter a valid weight in kg");
      return;
    }

    setLoadingItemUpdate(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/item/${editingItemWeight.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actual_weight: parseFloat(editingItemWeightValue) })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      setError("");
      setEditingItemWeight(null);
      setEditingItemWeightValue("");
      await fetchItems();
      alert("Item weight updated successfully");
    } catch (err) {
      setError(`Failed to update item weight: ${err.message}`);
    } finally {
      setLoadingItemUpdate(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
      setError("All fields required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setError("");
      setCreateForm({ name: "", email: "", phone: "", password: "", user_type: "seller" });
      setShowCreateUser(false);
      await fetchUsers();
      alert(`User created successfully: ${data.user_id}`);
    } catch (err) {
      setError(`Failed to create user: ${err.message}`);
    }
  };

  const logout = () => { localStorage.clear(); navigate("/admin/login"); };

  const filteredUsers = users.filter(u => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (u.name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s) || (u.phone || "").includes(s);
  });

  const filteredItems = items.filter(it => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (it.seller_name || "").toLowerCase().includes(s) || (it.category || "").toLowerCase().includes(s);
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-brand">
          <div className="brand-logo">A</div>
          <div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              Ridit Admin <span className="admin-badge">Official</span>
            </div>
            <div className="small muted">Manage users, items, subscriptions</div>
          </div>
        </div>

        <div className="admin-actions">
          <input className="form-input" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
          <button className="btn secondary" onClick={() => { fetchUsers(); fetchItems(); fetchSubscriptions(); }}>Refresh</button>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: "#fee", border: "1px solid #f88", borderRadius: 8, color: "#d32f2f" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button className={`btn ${tab === "users" ? "" : "secondary"}`} onClick={() => setTab("users")}>Users</button>
        <button className={`btn ${tab === "items" ? "" : "secondary"}`} onClick={() => setTab("items")}>Items</button>
        <button className={`btn ${tab === "subscriptions" ? "" : "secondary"}`} onClick={() => setTab("subscriptions")}>Subscriptions</button>
      </div>

      {tab === "users" && (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Users ({filteredUsers.length})</h3>
          <button className="btn secondary" onClick={() => setShowCreateUser(!showCreateUser)}>
            {showCreateUser ? "Cancel" : "Create User"}
          </button>
        </div>

        {showCreateUser && (
          <form onSubmit={handleCreateUser} style={{ marginBottom: 20, padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
            <h4>Create New User</h4>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Name</label>
              <input className="form-input" type="text" placeholder="Full name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Email</label>
              <input className="form-input" type="email" placeholder="Email address" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Phone</label>
              <input className="form-input" type="tel" placeholder="Phone number" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>Password</label>
              <input className="form-input" type="password" placeholder="Password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>User Type</label>
              <select className="form-input" value={createForm.user_type} onChange={e => setCreateForm({...createForm, user_type: e.target.value})}>
                <option value="seller">Seller</option>
                <option value="collector">Collector</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn">Create User</button>
          </form>
        )}

        <table className="table" aria-label="Users table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => (
              <tr key={u.id || i}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className="muted">{u.phone}</td>
                <td>{u.user_type}</td>
                <td>
                  {/* <button className="btn secondary" onClick={() => alert('Update role not implemented')}>Edit</button>{' '} */}
                  <button className="btn secondary" onClick={() => openSettings(u)}>Settings</button>{' '}
                  <button className="btn danger" onClick={() => deleteUser(u.id || u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {showEditUser && editUser && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowEditUser(false)}>
          <form className="card" style={{ maxWidth: 520, margin: 16 }} onClick={e => e.stopPropagation()} onSubmit={handleUpdateUser}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3>User Settings</h3>
              <button type="button" className="btn secondary" onClick={() => setShowEditUser(false)}>Close</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Name</label>
              <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Mobile</label>
              <input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Referred By (optional)</label>
              <input className="form-input" value={editForm.referred_by} onChange={e => setEditForm({...editForm, referred_by: e.target.value})} placeholder="Email or user id" />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn secondary" onClick={() => setShowEditUser(false)}>Cancel</button>
              <button type="submit" className="btn">Save</button>
            </div>
          </form>
        </div>
      )}

      {tab === "items" && (
      <div className="card">
        <h3>Items ({filteredItems.length})</h3>
        <table className="table" aria-label="Items table">
          <thead>
            <tr><th>Image</th><th>Seller</th><th>Category</th><th>Qty</th><th>Weight (kg)</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredItems.map((it, idx) => (
              <tr key={it.id || idx}>
                <td>
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.category} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                  ) : (
                    <span className="muted">No image</span>
                  )}
                </td>
                <td>{it.seller_name}</td>
                <td>{it.category}</td>
                <td>{it.quantity}</td>
                <td>{it.actual_weight ? `${it.actual_weight}` : <span className="muted">-</span>}</td>
                <td className="muted">{it.status}</td>
                <td>
                  <button className="btn secondary" onClick={() => handleEditItemWeight(it)} style={{ fontSize: "0.85rem" }}>Edit Weight</button>{' '}
                  <button className="btn secondary" onClick={() => setSelectedItem(it)} style={{ fontSize: "0.85rem" }}>View</button>{' '}
                  <button className="btn danger" onClick={() => deleteItem(it.id || idx)} style={{ fontSize: "0.85rem" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {tab === "subscriptions" && (
      <div className="card">
        <h3>Collector Subscriptions</h3>
        <table className="table" aria-label="Subscriptions table">
          <thead>
            <tr><th>Collector</th><th>Email</th><th>Phone</th><th>Status</th><th>Plan</th><th>Expiry</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, idx) => (
              <tr key={sub.collector_id || idx}>
                <td>{sub.collector_name}</td>
                <td>{sub.email}</td>
                <td>{sub.phone}</td>
                <td><strong style={{ color: sub.status === "active" ? "green" : "red" }}>{sub.status}</strong></td>
                <td>{sub.plan_type}</td>
                <td className="muted">{sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString() : "N/A"}</td>
                <td>
                  {sub.status === "inactive" && (
                    <button className="btn secondary" onClick={() => activateSubscription(sub.collector_id)}>Activate</button>
                  )}
                  {sub.status === "active" && (
                    <button className="btn danger" onClick={() => cancelSubscription(sub.collector_id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {selectedItem && (
        <div style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setSelectedItem(null)}>
          <div className="card" style={{ maxWidth: 600, maxHeight: "90vh", overflow: "auto", margin: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
              <h3>Item Details</h3>
              <button className="btn secondary" onClick={() => setSelectedItem(null)}>Close</button>
            </div>

            {selectedItem && selectedItem.image_url && (
              <img src={selectedItem.image_url} alt={selectedItem.category || "Item"} 
                style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 8, marginBottom: 16 }} />
            )}

            {selectedItem && (
              <table className="table" style={{ width: "100%" }}>
                <tbody>
                  <tr><td><strong>Seller</strong></td><td>{selectedItem.seller_name || "N/A"}</td></tr>
                  <tr><td><strong>Category</strong></td><td>{selectedItem.category || "N/A"}</td></tr>
                  <tr><td><strong>Quantity</strong></td><td>{selectedItem.quantity || "N/A"}</td></tr>
                  <tr><td><strong>Price</strong></td><td>₹{selectedItem.estimated_price || "N/A"}</td></tr>
                  <tr><td><strong>Status</strong></td><td>{selectedItem.status || "N/A"}</td></tr>
                  <tr><td><strong>Address</strong></td><td>
                    {selectedItem.address ? (
                      typeof selectedItem.address === 'object' 
                        ? `${selectedItem.address.street || ''}, ${selectedItem.address.city || ''}, ${selectedItem.address.zip_code || ''}`.trim().replace(/,\s*,/g, ',')
                        : selectedItem.address
                    ) : "N/A"}
                  </td></tr>
                  <tr><td><strong>Description</strong></td><td>{selectedItem.description || "No description"}</td></tr>
                  <tr><td><strong>Posted</strong></td><td>{selectedItem.posted_date ? new Date(selectedItem.posted_date).toLocaleDateString() : "N/A"}</td></tr>
                </tbody>
              </table>
            )}

            <div style={{ marginTop: 16 }}>
              <button className="btn danger" onClick={() => { deleteItem(selectedItem.id || selectedItem); setSelectedItem(null); }}>Delete Item</button>
            </div>
          </div>
        </div>
      )}

      {editingItemWeight && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setEditingItemWeight(null)}>
          <div className="card" style={{ maxWidth: 400, margin: 16 }} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16 }}>
              <h3>Edit Item Weight</h3>
              <p className="muted">{editingItemWeight.seller_name || "Item"} - {editingItemWeight.category}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                className="form-input" 
                value={editingItemWeightValue} 
                onChange={e => setEditingItemWeightValue(e.target.value)}
                placeholder="Enter weight in kilograms"
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn secondary" onClick={() => setEditingItemWeight(null)}>Cancel</button>
              <button type="button" className="btn" onClick={handleUpdateItemWeight} disabled={loadingItemUpdate}>
                {loadingItemUpdate ? "Updating..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;