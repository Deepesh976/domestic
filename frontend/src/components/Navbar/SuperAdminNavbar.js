import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import './SuperAdminNavbar.css';

const SuperAdminNavbar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // 🔥 CLOSED BY DEFAULT
  const [profileOpen, setProfileOpen] = useState(false);

  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const email = localStorage.getItem('email') || 'super@admin.com';

  /* =========================
     CLOSE SIDEBAR / PROFILE ON ROUTE CHANGE
  ========================= */
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================
     OUTSIDE CLICK HANDLER
  ========================= */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Sidebar
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }

      // Profile
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () =>
      document.removeEventListener('mousedown', handleOutsideClick);
  }, [sidebarOpen, profileOpen]);

  /* =========================
     LOGOUT
  ========================= */
  const handleLogout = () => {
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
            ref={hamburgerRef}
            className="hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* CENTER */}
        <div className="topbar-center">
          <h1 className="brand-title">Domestic RO Controller</h1>
        </div>

        {/* RIGHT */}
        <div className="topbar-right" ref={profileRef}>
          <button
            className="profile-btn"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <FiUser size={14} />
            <span>{email.split('@')[0]}</span>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button onClick={() => navigate('/profile')}>
                <FiUser /> Profile
              </button>
              <button className="logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ================= OVERLAY ================= */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
      >
        <nav className="menu">
          <NavLink end to="/superadmin">📊 Dashboard</NavLink>
          <NavLink to="/superadmin/organizations">🏢 Organizations</NavLink>
          <NavLink to="/superadmin/admins">👤 Admins</NavLink>
          <NavLink to="/superadmin/devices">📱 Devices</NavLink>
          <NavLink to="/superadmin/customers">👥 Customers</NavLink>
          <NavLink to="/superadmin/transactions">💳 Transactions</NavLink>
        </nav>
      </aside>

      {/* ================= CONTENT ================= */}
      <main className="content">{children}</main>
    </div>
  );
};

export default SuperAdminNavbar;
