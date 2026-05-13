import { useState, useEffect } from "react";
import API from "../api";
import NotificationBell from "../components/NotificationBell";

const EMPTY_FORM = {
  title: "", genre: "", price: "", isbn: "",
  language: "English", availabilityStart: "",
  availabilityEnd: "", coverImageUrl: "",
  publicationDate: ""
};

export default function OwnerDashboard({ navigate, onLogout }) {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks]         = useState([]);
  const [requests, setRequests]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [toast, setToast]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, r] = await Promise.all([
        API.get("/books/my"),
        API.get("/borrow/incoming"),
      ]);
      setBooks(b.data);
      setRequests(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const openCreate = () => { setEditBook(null); setForm(EMPTY_FORM); setShowModal(true); };

  const openEdit = (b) => {
    setEditBook(b);
    setForm({
      title:             b.title,
      genre:             b.genre,
      price:             b.borrowPrice,
      isbn:              b.isbn              || "",
      language:          b.language,
      availabilityStart: b.availabilityStart || "",
      availabilityEnd:   b.availabilityEnd   || "",
      coverImageUrl:     b.coverImageUrl     || "",
      publicationDate:   b.publicationDate   || "",
    });
    setShowModal(true);
  };

  const saveBook = async () => {
    if (!form.title || !form.genre || !form.price) return;
    try {
      const payload = {
        title:             form.title,
        genre:             form.genre,
        isbn:              form.isbn,
        language:          form.language,
        borrowPrice:       parseFloat(form.price),
        publicationDate:   form.publicationDate   || null,
        availabilityStart: form.availabilityStart || null,
        availabilityEnd:   form.availabilityEnd   || null,
        coverImageUrl:     form.coverImageUrl     || null,
      };
      if (editBook) {
        await API.put(`/books/${editBook.id}`, payload);
        showToast("Book updated ✓");
      } else {
        await API.post("/books", payload);
        showToast("Book submitted for approval ✓");
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    }
  };

  const deleteBook = async (id) => {
    try {
      await API.delete(`/books/${id}`);
      showToast("Book deleted");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Cannot delete", "error");
    }
  };

  const resolveRequest = async (id, action) => {
    try {
      await API.put(`/borrow/${id}/${action}`);
      showToast(`Request ${action === "accept" ? "accepted" : "rejected"} ✓`);
      fetchAll();
    } catch (err) {
      showToast("Failed", "error");
    }
  };

  const stats = [
    { label: "My Books",     value: books.length,                                        icon: "📚", color: "var(--accent)"  },
    { label: "Borrowed Now", value: books.filter(b => b.status === "Borrowed").length,   icon: "🔄", color: "var(--yellow)" },
    { label: "Available",    value: books.filter(b => b.status === "Available").length,  icon: "✅", color: "var(--green)"  },
    { label: "Pending Req.", value: requests.filter(r => r.status === "Pending").length, icon: "📩", color: "#6366f1"       },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav className="navbar">
        <div className="navbar-brand">
          Book<span>Circle</span>
          <span style={{ fontSize: 12, color: "var(--text2)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400, marginLeft: 6 }}>Owner</span>
        </div>
        <div className="navbar-actions">
          <NotificationBell user={user} />
          <button className="btn btn-ghost btn-sm"    onClick={() => navigate("home")}>Browse</button>
          <button className="btn btn-primary btn-sm"  onClick={openCreate}>+ Add Book</button>
          <button className="btn btn-outline btn-sm"  onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="page-wide">
        <div style={{ marginBottom: 28 }}>
          <h1 className="page-title">My Dashboard</h1>
          <p className="page-sub">Manage your book listings and borrow requests</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
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
            { key: "books",    label: `📚 My Books (${books.length})`    },
            { key: "requests", label: `📩 Requests (${requests.length})` },
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
            {/* Books Table */}
            {activeTab === "books" && (
              <div className="card">
                <div className="table-wrap">
                  {books.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text2)" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <p>No books yet.
                        <button className="btn btn-primary btn-sm" style={{ marginLeft: 8 }} onClick={openCreate}>
                          Add your first book
                        </button>
                      </p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Cover</th>
                          <th>Title</th>
                          <th>Genre</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Approved</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map(b => (
                          <tr key={b.id}>
                            <td>
                              {b.coverImageUrl ? (
                                <img src={b.coverImageUrl} alt={b.title}
                                  style={{ width: 40, height: 56, objectFit: "cover", borderRadius: 4 }} />
                              ) : (
                                <div style={{ width: 40, height: 56, background: "var(--bg2)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📖</div>
                              )}
                            </td>
                            <td><strong>{b.title}</strong></td>
                            <td><span className="badge badge-gray">{b.genre}</span></td>
                            <td style={{ color: "var(--accent)", fontWeight: 600 }}>{b.borrowPrice} EGP</td>
                            <td><span className={`badge ${b.status === "Borrowed" ? "badge-yellow" : "badge-green"}`}>{b.status}</span></td>
                            <td><span className={`badge ${b.isApproved ? "badge-green" : "badge-gray"}`}>{b.isApproved ? "Yes" : "Pending"}</span></td>
                            <td>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>✏️ Edit</button>
                                <button className="btn btn-danger btn-sm"  onClick={() => deleteBook(b.id)}>🗑 Delete</button>
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

            {/* Requests Table */}
            {activeTab === "requests" && (
              <div className="card">
                <div className="table-wrap">
                  {requests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text2)" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <p>No borrow requests yet.</p>
                    </div>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>Book</th>
                          <th>Reader</th>
                          <th>Dates</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.bookTitle}</strong></td>
                            <td>
                              <div>{r.readerName}</div>
                              <div style={{ fontSize: 12, color: "var(--text2)" }}>{r.readerEmail}</div>
                            </td>
                            <td style={{ fontSize: 13, color: "var(--text2)" }}>
                              {r.startDate || "—"} → {r.endDate || "—"}
                            </td>
                            <td>
                              <span className={`badge ${
                                r.status === "Accepted" ? "badge-green" :
                                r.status === "Rejected" ? "badge-red"   : "badge-yellow"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td>
                              {r.status === "Pending" ? (
                                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                  <button className="btn btn-success btn-sm" onClick={() => resolveRequest(r.id, "accept")}>✓ Accept</button>
                                  <button className="btn btn-danger btn-sm"  onClick={() => resolveRequest(r.id, "reject")}>✗ Reject</button>
                                </div>
                              ) : (
                                <div style={{ textAlign: "right", color: "var(--text2)", fontSize: 13 }}>Resolved</div>
                              )}
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>{editBook ? "Edit Book" : "Add New Book"}</h2>

            {/* Cover preview */}
            {form.coverImageUrl && (
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <img src={form.coverImageUrl} alt="Cover preview"
                  style={{ height: 120, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }}
                  onError={e => e.target.style.display = "none"} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["title",             "Title"],
                ["genre",             "Genre"],
                ["isbn",              "ISBN (optional)"],
                ["price",             "Borrow Price (EGP)"],
                ["publicationDate",   "Publication Date (YYYY-MM-DD)"],
                ["availabilityStart", "Available From (YYYY-MM-DD)"],
                ["availabilityEnd",   "Available Until (YYYY-MM-DD)"],
                ["coverImageUrl",     "Cover Image URL (optional)"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label>{l}</label>
                  <input className="input" value={form[k]}
                    onChange={e => setForm({ ...form, [k]: e.target.value })}
                    placeholder={k === "coverImageUrl" ? "https://covers.openlibrary.org/b/isbn/..." : ""} />
                </div>
              ))}
              <div>
                <label>Language</label>
                <select className="input" value={form.language}
                  onChange={e => setForm({ ...form, language: e.target.value })}>
                  {["English", "Arabic", "French", "German", "Spanish"].map(l => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveBook}>
                {editBook ? "Save Changes" : "Submit for Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

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
