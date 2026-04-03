import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from '../utils/axiosConfig';
import './ResetPassword.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    /* =========================
       TRY SUPER ADMIN FIRST
    ========================= */
    try {
      await axios.post(
        `/api/superadmin/auth/reset-password/${token}`,
        { password }
      );

      setMessage('Password updated successfully');
      setTimeout(() => navigate('/'), 2000);
      return;
    } catch (err) {
      // ⛔ ignore and try next role
    }

    /* =========================
       TRY HEADADMIN / ADMIN
    ========================= */
    try {
      await axios.post(
        `/api/headadmin/auth/reset-password/${token}`,
        { password }
      );

      setMessage('Password updated successfully');
      setTimeout(() => navigate('/'), 2000);
      return;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Invalid or expired reset token'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
