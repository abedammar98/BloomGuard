import { Link } from "react-router-dom";
import "../Styles/Navbar.css";   // ✅ moved out of Home.css

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        🌱 <span>BloomGuard</span>
      </Link>

      <div className="nav-links">
        <Link to="/graphs" className="nav-link">📊 Graphs</Link>
        <Link to="/assistant" className="nav-link">🤖 Assistant</Link>
        <Link to="/about" className="nav-link">About</Link>
      </div>
    </nav>
  );
}
