import { useState } from "react";
import API from "../api";

export default function Login({ onLogin }) {
  const [tab, setTab]   = useState("login");
  const [role, setRole] = useState("reader");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        const res = await API.post("/auth/login", {
          email:    form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user",  JSON.stringify(res.data.user));
        onLogin(res.data.user.role.toLowerCase());
      } else {
        await API.post("/auth/register", {
          name:     form.name,
          email:    form.email,
          password: form.password,
          role:     role,
        });
        alert(role === "owner"
          ? "Account created! Waiting for admin approval."
          : "Account created! Please log in.");
        setTab("login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>
            Book<span style={{ color: "var(--text)" }}>Circle</span>
          </div>
          <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>Community book sharing & lending</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", background: "var(--bg)", borderRadius: 8, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => setTab(t)} className="btn" style={{
                flex: 1, justifyContent: "center", borderRadius: 6, fontSize: 13, fontWeight: 600,
                background: tab === t ? "var(--surface)" : "transparent",
                color: tab === t ? "var(--text)" : "var(--text2)",
                boxShadow: tab === t ? "var(--shadow)" : "none", padding: "8px 0",
              }}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "#fdecea", border: "1px solid #f5c6c2", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "var(--red)", fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {tab === "register" && (
              <div>
                <label>Full Name</label>
                <input className="input" name="name" value={form.name} onChange={handle} placeholder="Jane Doe" required />
              </div>
            )}
            <div>
              <label>Email Address</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
            </div>
            <div>
              <label>Password</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
            </div>
            {tab === "register" && (
              <div>
                <label>I want to join as</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="reader">Reader — browse & borrow books</option>
                  <option value="owner">Book Owner — lend my books</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ marginTop: 4, justifyContent: "center", padding: "11px 0" }}>
              {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "var(--text2)", fontSize: 13, marginTop: 16 }}>
          {tab === "login" ? "Don't have an account? " : "Already registered? "}
          <button onClick={() => setTab(tab === "login" ? "register" : "login")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>
            {tab === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}