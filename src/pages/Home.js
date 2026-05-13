import { useState, useEffect } from "react";
import API from "../api";
import NotificationBell from "../components/NotificationBell";

export default function Home({ navigate, user, onLogout }) {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [genre, setGenre]       = useState("All");
  const [lang, setLang]         = useState("All");
  const [maxPrice, setMaxPrice] = useState(100);

  const GENRES = ["All", "Fiction", "Self-Help", "Sci-Fi", "History", "Tech"];
  const LANGS  = ["All", "English", "Arabic"];

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {};
        if (genre !== "All")  params.genre    = genre;
        if (lang  !== "All")  params.language = lang;
        if (maxPrice < 100)   params.maxPrice = maxPrice;
        if (search)           params.search   = search;
        const res = await API.get("/books", { params });
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [genre, lang, maxPrice, search]);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">Book<span>Circle</span></div>
        <div className="navbar-actions">
          {user?.role === "Owner" && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate("owner")}>My Dashboard</button>
          )}
          {user?.role === "Admin" && (
            <button className="btn btn-outline btn-sm" onClick={() => navigate("admin")}>Admin Panel</button>
          )}
          {user?.role === "Reader" && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("lists")}>🔖 My Lists</button>
          )}
          <NotificationBell user={user} />
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign Out</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => navigate("login")}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #2a1a0e 0%, #1C1A17 100%)", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#F7F4EF", fontSize: 32, marginBottom: 8 }}>Find your next great read</h1>
        <p style={{ color: "#a89880", marginBottom: 24 }}>Borrow books from readers in your community</p>
        <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input className="input" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            style={{ paddingLeft: 40, fontSize: 15, borderColor: "#3a3530", background: "#2a2520", color: "#F7F4EF" }} />
        </div>
      </div>

      <div className="page" style={{ paddingTop: 28 }}>
        {/* Filters */}
        <div className="card" style={{ padding: "16px 20px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 28 }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Genre</label>
            <select className="input" value={genre} onChange={e => setGenre(e.target.value)}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label>Language</label>
            <select className="input" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label>Max Price — <strong style={{ color: "var(--accent)" }}>{maxPrice} EGP</strong></label>
            <input type="range" min={5} max={100} step={5} value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
          </div>
          <div style={{ color: "var(--text2)", fontSize: 13 }}>
            {books.length} book{books.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text2)" }}>Loading books...</div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text2)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>No books found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {books.map(book => (
              <BookCard key={book.id} book={book} onClick={() => navigate("detail", book)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book, onClick }) {
  return (
    <div className="card" onClick={onClick}
      style={{ cursor: "pointer", overflow: "hidden", transition: "transform 0.18s, box-shadow 0.18s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ height: 200, overflow: "hidden", background: "var(--bg2)" }}>
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📖</div>
        )}
      </div>
      <div style={{ padding: "14px 14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, fontFamily: "'Lora', serif" }}>{book.title}</h3>
          <span className={`badge ${book.status === "Available" ? "badge-green" : "badge-yellow"}`} style={{ flexShrink: 0, fontSize: 11 }}>
            {book.status}
          </span>
        </div>
        <p style={{ color: "var(--text2)", fontSize: 12, marginBottom: 10 }}>{book.ownerName}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge badge-gray">{book.genre}</span>
          <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 14 }}>{book.borrowPrice} EGP</span>
        </div>
      </div>
    </div>
  );
}
