"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          Secure Drops
        </Link>
        <nav className="nav-links">
          <Link className={location.pathname === "/" ? "active" : ""} to="/">
            Share
          </Link>
          <Link className={location.pathname === "/unlock" ? "active" : ""} to="/unlock">
            Unlock
          </Link>
          <Link className={location.pathname === "/about" ? "active" : ""} to="/about">
          About
        </Link>
        <Link className={location.pathname === "/faq" ? "active" : ""} to="/faq">
          FAQ
        </Link>
        <Link className={location.pathname === "/privacy" ? "active" : ""} to="/privacy">
          Privacy
        </Link>
        <Link className={location.pathname === "/terms" ? "active" : ""} to="/terms">
          Terms
        </Link>
        <Link className={location.pathname === "/contact" ? "active" : ""} to="/contact">
          Contact
        </Link>
          {user && (
            <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">
              Dashboard
            </Link>
          )}
          {user && (
            <Link className={location.pathname === "/profile" ? "active" : ""} to="/profile">
              Profile
            </Link>
          )}
        </nav>
        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <button className="btn-outline" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
