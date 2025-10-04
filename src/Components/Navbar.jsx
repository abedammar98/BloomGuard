import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "../Styles/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);
  const btnRef = useRef(null);

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
      {/* Skip link لتحسين الوصول */}
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

        {/* زر الموبايل */}
        <button
          ref={btnRef}
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="vh">Toggle navigation</span>☰
        </button>

        {/* روابط الديسكتوب + قائمة الموبايل */}
        <div
          id="primary-navigation"
          ref={menuRef}
          className={`nav-links ${open ? "open" : ""}`}
          role="navigation"
        >
          <NavItem to="/graphs" label="📊 Graphs" />
          <NavItem to="/assistant" label="🤖 Assistant" />
          <NavItem to="/about" label="About" />
        </div>
      </nav>

      {/* طبقة تغطية لإغلاق القائمة عند الضغط خارجها على الموبايل */}
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
      // تحسين الوصول عبر العنوان
      aria-current={({ isActive }) => (isActive ? "page" : undefined)}
    >
      {label}
    </NavLink>
  );
}
