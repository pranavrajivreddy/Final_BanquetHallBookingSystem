import { NavLink, useNavigate } from "react-router-dom";
import { getUserRole } from "../lib/api";

const Navbar = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const isLoggedIn = !!role;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="site-nav">
      <div className="site-logo">
        <div className="site-logo-mark">HSE</div>
        <div>
          <h1 className="site-logo-title">Hotel Sindhura East Court</h1>
          <div className="site-logo-subtitle">Signature Banquet Collection</div>
        </div>
      </div>

      <div className="site-nav-links">
        <NavLink to="/" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
          Home
        </NavLink>

        {!isLoggedIn && (
          <NavLink to="/login" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
            Login
          </NavLink>
        )}

        {role === "customer" && isLoggedIn && (
          <>
            <NavLink to="/customer-dashboard" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
              Dashboard
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
              Updates
            </NavLink>
          </>
        )}

        {role === "admin" && isLoggedIn && (
          <NavLink to="/admin-dashboard" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
            Dashboard
          </NavLink>
        )}

        {role === "superadmin" && isLoggedIn && (
          <NavLink to="/superadmin" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
            Super Admin
          </NavLink>
        )}

        <NavLink to="/admin-register" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
          Help
        </NavLink>

        {!isLoggedIn && (
          <NavLink to="/register" className={({ isActive }) => `site-link${isActive ? " active" : ""}`}>
            Register
          </NavLink>
        )}

        {isLoggedIn && (
          <button onClick={handleLogout} className="site-button-link">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
