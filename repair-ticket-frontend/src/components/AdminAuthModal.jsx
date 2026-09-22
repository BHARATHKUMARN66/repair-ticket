import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Input, Select, Button } from './common';

export function AdminAuthModal({ isOpen, onClose, onSwitchToCustomer }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ROLE_ADMIN',
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
        await register(formData);
      } else {
        await login(formData.username.trim(), formData.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? 'Staff Account Provisioning' : 'Staff Operations Console'}
      subtitle={
        isRegister
          ? 'Provision an administrative or bench specialist user account.'
          : 'Sign in to access dispatch queues, technician benches, and customer records.'
      }
      maxWidth={420}
    >
      {/* Mode Switcher */}
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
          Staff Sign In
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
          Provision Staff
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
          <>
            <Input
              label="Staff Full Name"
              name="fullName"
              required
              placeholder="e.g. John Doe (Lead Tech)"
              value={formData.fullName}
              onChange={handleChange}
            />

            <Select
              label="Assigned System Role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'ROLE_ADMIN', label: 'Administrator (Full Oversight & Dispatch)' },
                { value: 'ROLE_TECHNICIAN', label: 'Technician (Bench Ops & Status FSM)' },
              ]}
            />
          </>
        )}

        <Input
          label="Staff Username"
          name="username"
          required
          placeholder="Enter staff username"
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
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          style={{ width: '100%', marginTop: 4 }}
        >
          {isRegister ? 'Provision Profile' : 'Enter Console'}
        </Button>

        {/* Switch to Customer Portal */}
        {onSwitchToCustomer && (
          <div style={{ textAlign: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Looking for customer support? </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToCustomer();
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
              Customer Client Portal &rarr;
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
}
