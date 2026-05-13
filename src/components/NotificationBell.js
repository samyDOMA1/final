import { useState, useEffect } from "react";
import API from "../api";
import { startConnection, stopConnection } from "../notifications";

export default function NotificationBell({ user }) {
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const [hasNew, setHasNew]   = useState(false);

  useEffect(() => {
    if (!user) return;

    // Load existing notifications
    API.get("/notifications")
      .then(r => {
        setNotifs(r.data);
        setHasNew(r.data.some(n => !n.isRead));
      })
      .catch(console.error);

    // Start SignalR
    const token = localStorage.getItem("token");
    startConnection(token, (data) => {
      setNotifs(prev => [{
        id:        Date.now(),
        type:      data.type,
        message:   data.message,
        isRead:    false,
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setHasNew(true);
    });

    return () => { stopConnection(); };
  }, [user]);

  const markAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setHasNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(!open); if (hasNew) markAllRead(); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 20, position: "relative", padding: "4px 8px"
        }}>
        🔔
        {hasNew && (
          <span style={{
            position: "absolute", top: 0, right: 0,
            width: 10, height: 10, borderRadius: "50%",
            background: "var(--red)", border: "2px solid white"
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 8,
          width: 320, maxHeight: 400, overflowY: "auto",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", boxShadow: "var(--shadow-lg)", zIndex: 500,
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
            {notifs.length > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12 }}>
                Mark all read
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text2)", fontSize: 13 }}>
              No notifications yet
            </div>
          ) : (
            notifs.map((n, i) => (
              <div key={i} style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                background: n.isRead ? "transparent" : "var(--bg)",
              }}>
                <div style={{ fontSize: 13, color: "var(--text)" }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 4 }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
