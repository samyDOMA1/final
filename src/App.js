import { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ReadingLists from "./pages/ReadingLists";
import "./index.css";

export default function App() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [page, setPage] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [user, setUser] = useState(savedUser);

  const navigate = (p, data = null) => {
    setSelectedBook(data);
    setPage(p);
  };

  const handleLogin = (role) => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setUser(u);
    if (role === "admin") navigate("admin");
    else if (role === "owner") navigate("owner");
    else navigate("home");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("home");
  };

  if (page === "login") return <Login onLogin={handleLogin} />;
  if (page === "home") return <Home navigate={navigate} user={user} onLogout={handleLogout} />;
  if (page === "detail") return <BookDetail book={selectedBook} navigate={navigate} user={user} />;
  if (page === "admin") return <AdminDashboard navigate={navigate} onLogout={handleLogout} />;
  if (page === "owner") return <OwnerDashboard navigate={navigate} onLogout={handleLogout} />;
  if (page === "lists") return <ReadingLists navigate={navigate} user={user} onLogout={handleLogout} />;
}
