import { useState, useEffect } from "react";
import API from "../api";
import NotificationBell from "../components/NotificationBell";

export default function ReadingLists({ navigate, user, onLogout }) {
  const [lists, setLists]         = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [books, setBooks]         = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState(null);

  useEffect(() => { fetchLists(); }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await API.get("/lists");
      setLists(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async (listId) => {
    try {
      const res = await API.get(`/lists/${listId}/books`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectList = (list) => {
    setSelectedList(list);
    fetchBooks(list.id);
  };

  const createList = async () => {
    if (!newListName.trim()) return;
    try {
      await API.post("/lists", { name: newListName.trim() });
      setNewListName("");
      setShowModal(false);
      fetchLists();
      showToast("List created ✓");
    } catch (err) {
      showToast("Failed to create list", "error");
    }
  };

  const deleteList = async (id) => {
    try {
      await API.delete(`/lists/${id}`);
      if (selectedList?.id === id) {
        setSelectedList(null);
        setBooks([]);
      }
      fetchLists();
      showToast("List deleted");
    } catch (err) {
      showToast("Failed to delete list", "error");
    }
  };

  const removeBook = async (bookId) => {
    try {
      await API.delete(`/lists/${selectedList.id}/books/${bookId}`);
      setBooks(books.filter(b => b.id !== bookId));
      showToast("Book removed from list");
    } catch (err) {
      showToast("Failed to remove book", "error");
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Book<span>Circle</span></div>
        <div className="navbar-actions">
          <NotificationBell user={user} />
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("home")}>← Browse</button>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <div className="page" style={{ paddingTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 className="page-title">My Reading Lists</h1>
            <p className="page-sub">Books you want to read</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New List</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text2)" }}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" }}>

            {/* Lists sidebar */}
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Your Lists ({lists.length})
              </h3>
              {lists.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text2)", fontSize: 13 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                  No lists yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {lists.map(l => (
                    <div key={l.id}
                      onClick={() => selectList(l)}
                      style={{
                        padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                        background: selectedList?.id === l.id ? "var(--bg2)" : "transparent",
                        border: selectedList?.id === l.id ? "1px solid var(--border)" : "1px solid transparent",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        transition: "all 0.15s"
                      }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{l.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text2)" }}>{l.bookCount} book{l.bookCount !== 1 ? "s" : ""}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteList(l.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text2)", fontSize: 16, padding: "2px 6px" }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Books in selected list */}
            <div>
              {!selectedList ? (
                <div className="card" style={{ padding: "48px 0", textAlign: "center", color: "var(--text2)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
                  <p>Select a list to see its books</p>
                </div>
              ) : (
                <div className="card">
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: 18 }}>{selectedList.name}</h2>
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{books.length} book{books.length !== 1 ? "s" : ""}</span>
                  </div>

                  {books.length === 0 ? (
                    <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text2)" }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                      <p style={{ marginBottom: 16 }}>No books in this list yet.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate("home")}>
                        Browse Books
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, padding: 20 }}>
                      {books.map(b => (
                        <div key={b.id} className="card" style={{ overflow: "hidden", position: "relative" }}>
                          <div style={{ height: 160, background: "var(--bg2)", overflow: "hidden" }}>
                            {b.coverImageUrl ? (
                              <img src={b.coverImageUrl} alt={b.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📖</div>
                            )}
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{b.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 8 }}>{b.ownerName}</div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: "center", fontSize: 11 }}
                                onClick={() => navigate("detail", b)}>
                                View
                              </button>
                              <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }}
                                onClick={() => removeBook(b.id)}>
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New List Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 28 }}>
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Create New List</h2>
            <div>
              <label>List Name</label>
              <input className="input" value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="e.g. Want to Read, Favourites…"
                onKeyDown={e => e.key === "Enter" && createList()} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createList}>Create</button>
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
