"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth" // Assuming useAuth is a custom hook that provides user information

const Navbar = () => {
  const location = useLocation()
  const { user } = useAuth() // Declare the user variable using the useAuth hook

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">Logo</Link>
      </div>
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
    </nav>
  )
}

export default Navbar
