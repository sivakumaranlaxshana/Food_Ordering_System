import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const [expanded, setExpanded] = useState(false);

  const { user, loading, isAdmin, logout } = useAuth();
  const { cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  function closeMenu() {
    setExpanded(false);
  }

  function handleLogout() {
    logout();
    clearCart();
    closeMenu();
    navigate("/login");
  }

  function navClass({ isActive }) {
    return `nav-link ${isActive ? "active fw-bold" : ""}`;
  }

  return (
    <nav
      className="navbar navbar-expand-lg bg-white border-bottom sticky-top"
      aria-label="Main navigation"
    >
      <div className="container py-2">
        <Link
          className="navbar-brand fw-bold fs-3"
          to="/"
          onClick={closeMenu}
          style={{ color: "#174b3b" }}
        >
          Little<span style={{ color: "#ed7540" }}>Table.</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded={expanded}
          aria-label="Toggle navigation"
          onClick={() => setExpanded((current) => !current)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          id="mainNavbar"
          className={`collapse navbar-collapse ${
            expanded ? "show" : ""
          }`}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={navClass}
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/foods"
                className={navClass}
                onClick={closeMenu}
              >
                Our Menu
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/cart"
                className={navClass}
                onClick={closeMenu}
              >
                Cart{" "}
                <span className="badge rounded-pill text-bg-success">
                  {cartCount}
                </span>
              </NavLink>
            </li>

            {!loading && user && !isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/my-orders"
                  className={navClass}
                  onClick={closeMenu}
                >
                  My Orders
                </NavLink>
              </li>
            )}

            {!loading && isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={navClass}
                  onClick={closeMenu}
                >
                  Admin
                </NavLink>
              </li>
            )}

            {!loading && !user && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/login"
                    className={navClass}
                    onClick={closeMenu}
                  >
                    Login
                  </NavLink>
                </li>

                <li className="nav-item py-2 py-lg-0">
                  <Link
                    to="/register"
                    className="btn btn-success rounded-pill px-4"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {!loading && user && (
              <li className="nav-item d-flex flex-wrap align-items-center gap-3 py-2 py-lg-0">
                <span className="small text-secondary">
                  Hi, {user.name}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}