import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AppLayout.css";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true, icon: "⌂" },
  { to: "/employees", label: "Employees", icon: "♙" },
  { to: "/admin/attendance", label: "Attendance records", end: true, icon: "◷" },
  { to: "/admin/attendance/monthly", label: "Attendance sheet", icon: "▦" },
  { to: "/admin/work-areas", label: "Work areas", icon: "⌖" },
  { to: "/admin/schedule", label: "Calendar & office hours", icon: "▣" },
  { to: "/leaves", label: "Leave requests", icon: "✉" },
  { to: "/profile", label: "My profile", icon: "◉" },
];

const employeeLinks = [
  { to: "/employee", label: "Dashboard", end: true, icon: "⌂" },
  { to: "/attendance/history", label: "Attendance history", icon: "◷" },
  { to: "/leaves", label: "My leaves", icon: "✉" },
  { to: "/profile", label: "My profile", icon: "◉" },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = user?.role === "ADMIN" ? adminLinks : employeeLinks;
  const displayName = user?.email || (user?.role === "ADMIN" ? "Administrator" : "Employee");

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="app-menu-toggle"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span>{menuOpen ? "×" : "☰"}</span>
      </button>

      {menuOpen && <button className="app-sidebar-scrim" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}

      <aside className={`app-sidebar${menuOpen ? " is-open" : ""}`}>
        <NavLink to={user?.role === "ADMIN" ? "/admin" : "/employee"} className="app-brand">
          <span className="app-brand-mark">A</span>
          <span>AttendPro</span>
        </NavLink>

        <div className="app-nav-caption">WORKSPACE</div>
        <nav className="app-navigation" aria-label="Main navigation">
          {links.map(({ to, label, end, icon }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `app-nav-link${isActive ? " is-active" : ""}`}>
              <span className="app-nav-icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-bottom">
          <div className="app-user-card">
            <span className="app-user-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <span className="app-user-details">
              <strong>{displayName}</strong>
              <small>{user?.role === "ADMIN" ? "Administrator" : "Employee"}</small>
            </span>
          </div>
          <button type="button" className="app-logout" onClick={logout}>
            <span className="app-nav-icon" aria-hidden="true">↪</span> Sign out
          </button>
        </div>
      </aside>

      <div className="app-content">{children}</div>
    </div>
  );
}
