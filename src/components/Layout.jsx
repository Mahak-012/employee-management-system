import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../hooks/useTheme.js";
import { resetDemoData } from "../api/employeeApi.js";

export default function Layout() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    resetDemoData();
    window.location.href = "/";
  };

  return (
    <div className="app-shell">
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-logo">EH</div>
          <div>
            <h2>EmployeeHub</h2>
            <p>Management System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
          <NavLink
            to="/employees/new"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">➕</span> Add Employee
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="side-btn" onClick={toggle}>
            <span className="nav-icon">{theme === "light" ? "🌙" : "☀️"}</span>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <button className="side-btn" onClick={handleReset}>
            <span className="nav-icon">♻️</span> Reset Demo Data
          </button>
          <p className="version-tag">React CRUD · Task 6</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(true)}>☰</button>
          <span className="topbar-brand">EmployeeHub</span>
          <button className="theme-btn-sm" onClick={toggle}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}