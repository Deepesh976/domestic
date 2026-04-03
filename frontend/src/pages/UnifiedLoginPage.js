import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { handleBuilderAuth } from '../utils/builderAuth'; // ✅ ADDED
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './UnifiedLoginPage.css';

/* =====================================================
  UNIFIED LOGIN PAGE
  Roles:
  - superadmin
  - headadmin
  - admin
===================================================== */

const UnifiedLoginPage = () => {
  /* =========================
    STATE
  ========================= */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  /* =========================
    AUTO REDIRECT IF LOGGED IN
  ========================= */
  useEffect(() => {
    if (hasRedirected.current) return;

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) return;

    hasRedirected.current = true;

    if (role === 'superadmin') {
      navigate('/superadmin', { replace: true });
    } else {
      navigate('/headadmin', { replace: true });
    }
  }, [navigate]);

  /* =========================
    DISABLE SCROLLING ON LOGIN
  ========================= */
  useEffect(() => {
    // Disable scrolling when component mounts
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    // Re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
    };
  }, []);

  /* =========================
    LOGIN HANDLER
  ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ BUILDER VISUAL EDITOR MODE
    if (handleBuilderAuth(navigate)) return;

    setError('');
    setMessage('');
    setLoading(true);

    localStorage.clear();

    try {
      /* =========================
        1️⃣ SUPER ADMIN LOGIN
      ========================= */
      const superAdminRes = await fetch(
        'https://admin.smartroplus.in/api/superadmin/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const superAdminData = await superAdminRes.json();

      if (superAdminRes.ok && superAdminData.role === 'superadmin') {
        saveSession(superAdminData);
        navigate('/superadmin', { replace: true });
        return;
      }

      /* =========================
        2️⃣ HEADADMIN / ADMIN LOGIN
      ========================= */
      const orgUserRes = await fetch(
        'https://admin.smartroplus.in/api/headadmin/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const orgUserData = await orgUserRes.json();

      if (
        orgUserRes.ok &&
        (orgUserData.role === 'headadmin' ||
          orgUserData.role === 'admin')
      ) {
        console.log('✅ HeadAdmin Login Response:', orgUserData);
        console.log('📦 Organization Data:', {
          org_id: orgUserData.organization?.org_id,
          org_name: orgUserData.organization?.org_name,
          logo: orgUserData.organization?.logo,
        });

        // Validate organization data
        if (!orgUserData.organization) {
          console.error('❌ LOGIN ERROR: Response missing organization', {
            organization: orgUserData.organization,
          });
          setError('Organization data missing. Please contact administrator.');
          return;
        }

        // Ensure org_id exists (with fallback)
        const orgId = orgUserData.organization.org_id;
        if (!orgId) {
          console.warn('⚠️ WARNING: org_id not in organization object', {
            organization: orgUserData.organization,
          });
          console.error('❌ LOGIN ERROR: No org_id found', {
            hasOrgId: !!orgId,
          });
          setError('Organization ID not configured. Please contact administrator.');
          return;
        }

        saveSession(orgUserData);
        console.log('💾 Session saved. localStorage.org_id:', localStorage.getItem('org_id'));
        navigate('/headadmin', { replace: true });
        return;
      }

      if (!orgUserRes.ok) {
        console.error('❌ HeadAdmin Login Error:', orgUserData);
        setError(orgUserData.message || 'Invalid email or password');
        return;
      }

      setError('Invalid email or password');
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
    FORGOT PASSWORD HANDLER
  ========================= */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      let res = await fetch(
        'https://admin.smartroplus.in/api/superadmin/auth/forgot-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );

      if (!res.ok) {
        res = await fetch(
          'https://admin.smartroplus.in/api/headadmin/auth/forgot-password',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail }),
          }
        );
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to send reset link');
      } else {
        setMessage(
          'If this email exists, a password reset link has been sent.'
        );
      }
    } catch (err) {
      console.error('FORGOT PASSWORD ERROR:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
    SAVE SESSION
  ========================= */
  const saveSession = (data) => {
    // Validate organization for headadmin/admin roles
    if (
      (data.role === 'headadmin' || data.role === 'admin') &&
      (!data.organization || !data.organization.org_id)
    ) {
      console.error(
        '❌ CRITICAL: Organization not linked to headadmin/admin',
        { role: data.role, organization: data.organization }
      );
      setError(
        'Organization not properly configured. Contact your administrator.'
      );
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);

    if (data.organization) {
      localStorage.setItem('org_id', data.organization.org_id);
      localStorage.setItem('org_name', data.organization.org_name || '');
      localStorage.setItem('org_logo', data.organization.logo || '');
    }

    localStorage.setItem('email', data.user?.email || '');
    localStorage.setItem(
      'username',
      data.user?.username ||
        (data.role === 'superadmin'
          ? 'Super Admin'
          : data.role === 'headadmin'
          ? 'Head Admin'
          : 'Admin')
    );

    dispatch(
      loginSuccess({
        token: data.token,
        role: data.role,
        org_id: data.organization?.org_id || null,
        org_name: data.organization?.org_name || null,
        org_logo: data.organization?.logo || null,
        email: data.user?.email || '',
        username:
          data.user?.username ||
          (data.role === 'superadmin'
            ? 'Super Admin'
            : data.role === 'headadmin'
            ? 'Head Admin'
            : 'Admin'),
      })
    );
  };

  /* =========================
    UI
  ========================= */
  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/background_image.png)`,
      }}
    >
      <div className="title-bar">
        <h1 className="title-bar-text">Domestic RO Controller</h1>
      </div>
      <div className="login-layout">
        {/* <div className="purifier-section">
          <img
            src={`${process.env.PUBLIC_URL}/purifier.png`}
            alt="Water Purifier Product"
            className="purifier-image"
          />
        </div> */}
        <div className="login-wrapper">
          <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Welcome User</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {!showForgot ? (
            <>
              <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      className="form-input password-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="forgot-link">
                <button type="button" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
              </div>
            </>
          ) : (
            <>
              <form
                className="login-form"
                onSubmit={handleForgotPassword}
              >
                <div className="form-group">
                  <label className="form-label">
                    Enter your registered email
                  </label>
                  <input
                    className="form-input"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  className="login-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div className="forgot-link">
                <button type="button" onClick={() => setShowForgot(false)}>
                  Back to login
                </button>
              </div>
            </>
          )}

          <div className="login-footer">
            © 2025 Domesticro. All rights reserved.
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default UnifiedLoginPage;
