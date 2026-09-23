import { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

export default function NavBar({ onDark = false, active = "" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={`navbar ${onDark ? "navbar--on-dark" : ""}`}>
      <div className="navbar__left">
        <img src="/src/assets/triode-icon.svg" alt="" className="navbar__icon" />
        <span className="navbar__brand">TRIODE</span>
      </div>

      <div className="navbar__links navbar__links--desktop">
        <Link to="/" className={active === "home" ? "navbar__link navbar__link--active" : "navbar__link"}>Home</Link>
        <Link to="/app" className={active === "dapp" ? "navbar__link navbar__link--active" : "navbar__link"}>Dapp</Link>
        <Link to="/info" className={active === "info" ? "navbar__link navbar__link--active" : "navbar__link"}>Info</Link>
      </div>

      <button type="button" className="navbar__connect navbar__connect--desktop">
        Connect Wallet
      </button>

      <button
        type="button"
        className="navbar__hamburger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/app" onClick={() => setMenuOpen(false)}>Dapp</Link>
          <Link to="/info" onClick={() => setMenuOpen(false)}>Info</Link>
          <button type="button" className="navbar__connect">Connect Wallet</button>
        </div>
      )}
    </nav>
  );
}
