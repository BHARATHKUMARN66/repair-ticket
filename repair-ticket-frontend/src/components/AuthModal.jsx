import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ROLE_USER',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register({
          username: formData.username.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          role: formData.role,
        });
      } else {
        await login(formData.username.trim(), formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: '#eff6ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isRegister ? 'Create System Account' : 'Sign In to OmniFix'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            color: '#991b1b',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="e.g. Alex Henderson"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="ROLE_USER">Customer / Standard User</option>
                  <option value="ROLE_TECHNICIAN">Repair Technician</option>
                  <option value="ROLE_ADMIN">System Administrator</option>
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Select role for permissions testing.
                </small>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Register & Sign In' : 'Sign In')}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.25rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid var(--border-subtle)', 
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); setIsRegister(false); setError(null); }} style={{ fontWeight: 600 }}>
                Sign In
              </a>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <a href="#register" onClick={(e) => { e.preventDefault(); setIsRegister(true); setError(null); }} style={{ fontWeight: 600 }}>
                Register here
              </a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
