import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from '../../redux/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/superadmin/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      console.log('🔥 LOGIN RESPONSE:', data);

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      const { token, role, _id, name } = data;

      if (!token || !role) {
        setError('Invalid login response from server');
        return;
      }

      /* =========================
         STORE AUTH DATA
      ========================= */
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', _id);
      localStorage.setItem('username', name);

      dispatch(
        loginSuccess({
          token,
          role,
        })
      );

      /* =========================
         ROUTING
      ========================= */
      if (role === 'SUPERADMIN') {
        navigate('/super-admin', { replace: true });
      } else if (role === 'HEADADMIN') {
        navigate('/headadmin', { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        setError('Unauthorized role');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleLogin} style={{ width: '320px' }}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px' }}
        />

        <button type="submit" style={{ width: '100%' }}>
          Login
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
