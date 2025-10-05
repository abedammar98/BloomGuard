import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../Styles/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // ثيم: التقط الحالة الحالية من الـhtml
  const getTheme = () =>
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  const [theme, setTheme] = useState(getTheme());

  function applyTheme(t) {
    const html = document.documentElement;
    html.setAttribute("data-theme", t);
    html.style.colorScheme = t;
    try {
      localStorage.setItem("theme", t);
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
    setTheme(t);
  }
  function toggleTheme() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  // اغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // اغلاق عند الضغط خارج القائمة
  useEffect(() => {
    function onClickOutside(e) {
      if (!open) return;
      const menu = menuRef.current;
      const btn = btnRef.current;
      if (menu && !menu.contains(e.target) && btn && !btn.contains(e.target)) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <nav className={`navbar ${open ? "is-open" : ""}`} aria-label="Primary">
        <NavLink to="/" className="nav-logo" aria-label="BloomGuard Home">
          <span className="logo-emoji" aria-hidden>
            🌱
          </span>
          <span className="logo-text">BloomGuard</span>
        </NavLink>

        <div
          className="nav-links"
          id="primary-navigation"
          ref={menuRef}
          role="navigation"
        >
          <NavItem to="/graphs" label="📊 Graphs" />
          <NavItem to="/assistant" label="🤖 Assistant" />
          <NavItem to="/about" label="About" />
        </div>

        {/* يمين الشريط: زر الثيم + زر الموبايل */}
        <div className="nav-actions">
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            ref={btnRef}
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen((v) => !v)}
            title="Toggle navigation"
          >
            <span className="vh">Toggle navigation</span>☰
          </button>
        </div>
      </nav>

      {open && (
        <button
          className="nav-overlay"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {label}
    </NavLink>
  );
}
