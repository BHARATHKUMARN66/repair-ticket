import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Input, Button } from './common';

export function CustomerAuthModal({ isOpen, onClose, onSwitchToAdmin }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({
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
        // Enforce ROLE_USER for client portal registrations
        await register({
          username: formData.username.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          role: 'ROLE_USER',
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Create Customer Account' : 'Customer Sign In'}
      subtitle={
        isRegister
          ? 'Join the OmniFix Client Portal to request repairs and track hardware status.'
          : 'Sign in to access your active repairs, device history, and estimates.'
      }
      maxWidth={420}
    >
      {/* Mode Switcher Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          padding: 3,
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          marginBottom: 18,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsRegister(false);
            setError(null);
          }}
          style={{
            padding: '6px 0',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 4,
            border: 'none',
            background: !isRegister ? '#ffffff' : 'transparent',
            color: !isRegister ? '#0f172a' : '#64748b',
            boxShadow: !isRegister ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
          }}
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => {
            setIsRegister(true);
            setError(null);
          }}
          style={{
            padding: '6px 0',
            fontSize: '0.8125rem',
            fontWeight: 600,
            borderRadius: 4,
            border: 'none',
            background: isRegister ? '#ffffff' : 'transparent',
            color: isRegister ? '#0f172a' : '#64748b',
            boxShadow: isRegister ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            cursor: 'pointer',
          }}
        >
          Register
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 6,
            padding: '10px 14px',
            fontSize: '0.8125rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isRegister && (
          <Input
            label="Full Name"
            name="fullName"
            required
            placeholder="e.g. Alex Morgan"
            value={formData.fullName}
            onChange={handleChange}
          />
        )}

        <Input
          label="Username / Client ID"
          name="username"
          required
          placeholder={isRegister ? 'Choose a unique username' : 'Enter your client username'}
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          style={{ width: '100%', marginTop: 4 }}
        >
          {isRegister ? 'Register Account' : 'Sign In'}
        </Button>

        {/* Switch to Staff Console */}
        {onSwitchToAdmin && (
          <div style={{ textAlign: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>OmniFix Staff or Specialist? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToAdmin();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Staff & Bench Console &rarr;
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
