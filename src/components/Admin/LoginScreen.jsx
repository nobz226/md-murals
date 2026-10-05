import { useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { errorMessage, useAdmin } from './AdminContext';

function LoginScreen() {
  const convex = useConvex();
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setChecking(true);
    setError('');
    try {
      const valid = await convex.query(api.adminAuth.checkAdminKey, { adminKey: password });
      if (valid) {
        login(password);
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-card admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-brand">
          <span className="admin-brand-dot" />
          MD Murals Admin
        </div>
        <label className="admin-field">
          <span className="admin-label">Password</span>
          <input
            type="password"
            className="admin-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error-text">{error}</p>}
        <button type="submit" className="admin-btn admin-btn-primary admin-btn-block" disabled={checking || !password}>
          {checking ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}

export default LoginScreen;
