import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import {
  MdDashboard,
  MdPeople,
  MdDevices,
  MdPayments,
  MdListAlt,
  MdEngineering,
  MdSupportAgent,
} from 'react-icons/md';
import './AdminNavbar.css';

export default function AdminNavbar({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* =========================
     AUTH / ORG CONTEXT
  ========================= */
  const name = localStorage.getItem('username') || 'User';
  const orgName = localStorage.getItem('org_name') || 'Organization';
  const orgLogo = localStorage.getItem('org_logo');

  const API_BASE =
    process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /* =========================
     CLOSE MENUS ON ROUTE CHANGE
  ========================= */
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="layout">
      {/* ================= TOP BAR ================= */}
      <header className="topbar">
        {/* LEFT */}
        <div className="topbar-left">
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <FiMenu size={22} />
          </button>
        </div>

        {/* CENTER */}
        <div className="topbar-center">
          {orgLogo ? (
            <img
              src={`${API_BASE}/uploads/organizations/${orgLogo}`}
              alt="Organization Logo"
              className="org-logo"
            />
          ) : (
            <div className="org-fallback">
              {orgName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="org-name">{orgName}</span>
        </div>

        {/* RIGHT */}
        <div className="topbar-right profile">
          <button
            className="profile-btn"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <FiUser />
            <span>{name}</span>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button onClick={() => navigate('/profile')}>
                <FiUser /> Profile
              </button>
              <button className="logout" onClick={logout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= OVERLAY (MOBILE) ================= */}
      {menuOpen && (
        <div
          className="overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <nav className="menu">
          <NavItem to="/headadmin" icon={<MdDashboard />} label="Dashboard" />
          <NavItem
            to="/headadmin/customers"
            icon={<MdPeople />}
            label="Customers"
          />
          <NavItem
            to="/headadmin/purifiers"
            icon={<MdDevices />}
            label="Purifiers"
          />
          <NavItem
            to="/headadmin/transactions"
            icon={<MdPayments />}
            label="Transactions"
          />
          <NavItem
            to="/headadmin/plans"
            icon={<MdListAlt />}
            label="Plans"
          />
          <NavItem
            to="/headadmin/technicians"
            icon={<MdEngineering />}
            label="Technicians"
          />
          <NavItem
            to="/headadmin/installations"
            icon={<MdEngineering />}
            label="Installations"
          />
          <NavItem
            to="/headadmin/service-requests"
            icon={<MdSupportAgent />}
            label="Service Requests"
          />
          <NavItem
            to="/headadmin/support"
            icon={<MdSupportAgent />}
            label="Support"
          />
        </nav>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="content">
        {children}
      </main>
    </div>
  );
}

/* ================= MENU ITEM ================= */
const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      isActive ? 'menu-item active' : 'menu-item'
    }
  >
    <span className="icon">{icon}</span>
    <span>{label}</span>
  </NavLink>
);
