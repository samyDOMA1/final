import { useState, useEffect } from "react";
import API from "../api";
import NotificationBell from "../components/NotificationBell";

export default function AdminDashboard({ navigate, onLogout }) {
  const [activeTab, setActiveTab] = useState("accounts");
  const [accounts, setAccounts]   = useState([]);
  const [posts, setPosts]         = useState([]);
  const [toast, setToast]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [acc, pst] = await Promise.all([
        API.get("/admin/pending-accounts"),
        API.get("/admin/pending-posts"),
      ]);
      setAccounts(acc.data);
      setPosts(pst.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const resolveAccount = async (id, action) => {
    try {
      await API.put(`/admin/accounts/${id}/${action}`);
      setAccounts(a => a.filter(x => x.id !== id));
      showToast(`Account ${action === "approve" ? "approved" : "rejected"} ✓`);
    } catch (err) {
      showToast("Failed", "error");
    }
  };

  const resolvePost = async (id, action) => {
    try {
      await API.put(`/admin/posts/${id}/${action}`);
      setPosts(p => p.filter(x => x.id !== id));
      showToast(`Post ${action === "approve" ? "approved" : "rejected"} ✓`, action === "approve" ? "success" : "error");
    } catch (err) {
      showToast("Failed", "error");
    }
  };

  const stats = [
    { label: "Pending Accounts", value: accounts.length, icon: "👤", color: "var(--yellow)" },
    { label: "Pending Posts",    value: posts.length,    icon: "📚", color: "var(--accent)" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav className="navbar">
        <div className="navbar-brand">
          Book<span>Circle</span>
          <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, marginLeft: 6 }}>Admin</span>
        </div>
        <div className="navbar-actions">
          <NotificationBell user={user} />
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("home")}>View Site</button>
          <button className="btn btn-outline btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="page-wide">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-sub">Review pending accounts and book posts</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--bg2)", borderRadius: 8, padding: 4, width: "fit-content" }}>
          {[
            { key: "accounts", label: `👤 Accounts (${accounts.length})` },
            { key: "posts",    label: `📚 Posts (${posts.length})` }
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className="btn" style={{
              borderRadius: 6, fontSize: 13, fontWeight: 600, padding: "8px 18px",
              background: activeTab === t.key ? "var(--surface)" : "transparent",
              color:      activeTab === t.key ? "var(--text)"    : "var(--text2)",
              boxShadow:  activeTab === t.key ? "var(--shadow)"  : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Loading...</div>
        ) : (
          <>
            {/* Accounts Table */}
            {activeTab === "accounts" && (
              <div className="card">
                <div className="table-wrap">
                  {accounts.length === 0 ? (
                    <Empty icon="✅" text="All accounts reviewed!" />
                  ) : (
                    <table>
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Applied</th><th style={{ textAlign: "right" }}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {accounts.map(a => (
                          <tr key={a.id}>
                            <td><strong>{a.name}</strong></td>
                            <td style={{ color: "var(--text2)" }}>{a.email}</td>
                            <td style={{ color: "var(--text2)", fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="btn btn-success btn-sm" onClick={() => resolveAccount(a.id, "approve")}>✓ Approve</button>
                                <button className="btn btn-danger btn-sm"  onClick={() => resolveAccount(a.id, "reject")}>✗ Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Posts Table */}
            {activeTab === "posts" && (
              <div className="card">
                <div className="table-wrap">
                  {posts.length === 0 ? (
                    <Empty icon="✅" text="All posts reviewed!" />
                  ) : (
                    <table>
                      <thead>
                        <tr><th>Title</th><th>Owner</th><th>Genre</th><th>Price</th><th style={{ textAlign: "right" }}>Actions</th></tr>
                      </thead>
                      <tbody>
                        {posts.map(p => (
                          <tr key={p.id}>
                            <td><strong>{p.title}</strong></td>
                            <td style={{ color: "var(--text2)" }}>{p.ownerName}</td>
                            <td><span className="badge badge-gray">{p.genre}</span></td>
                            <td style={{ color: "var(--accent)", fontWeight: 600 }}>{p.borrowPrice} EGP</td>
                            <td>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="btn btn-success btn-sm" onClick={() => resolvePost(p.id, "approve")}>✓ Approve</button>
                                <button className="btn btn-danger btn-sm"  onClick={() => resolvePost(p.id, "reject")}>✗ Reject</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 999,
          background: toast.type === "error" ? "var(--red)" : "var(--green)",
          color: "#fff", padding: "12px 20px", borderRadius: 8,
          boxShadow: "var(--shadow-lg)", fontSize: 14, fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text2)" }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <p>{text}</p>
    </div>
  );
}
