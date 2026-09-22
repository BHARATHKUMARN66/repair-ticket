import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input, Select, Button } from '../components/common';
import { BrandLogo } from '../components/layout/BrandLogo';

export function AdminLoginPage({ onNavigate }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'ROLE_ADMIN',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas-bg">
      {/* Top Header Branding */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 12 }}>
          <BrandLogo subtitle="Operations & Dispatch Console" badgeText="Admin" badgeVariant="admin" />
        </div>
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Restricted Administrative Access
          </span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
          padding: 32,
          transition: 'all 200ms ease',
        }}
      >
        {/* Mode Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            style={{
              padding: '8px 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? '#0f172a' : '#64748b',
              boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
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
              padding: '8px 0',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              background: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? '#0f172a' : '#64748b',
              boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            Provision Staff
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            {isRegister ? 'Staff Account Provisioning' : 'Administrator Sign In'}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {isRegister
              ? 'Provision a new administrative or bench specialist operations profile.'
              : 'Sign in to access tickets dispatch, CRM records, hardware inventory, and technician management.'}
          </p>
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
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isRegister && (
            <>
              <Input
                label="Staff Full Name"
                name="fullName"
                required
                placeholder="e.g. John Doe (Lead Admin)"
                value={formData.fullName}
                onChange={handleChange}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                }
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
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
              </svg>
            }
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            helperText={isRegister ? 'Minimum 6 characters required' : null}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            }
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            style={{ width: '100%', marginTop: 6, fontWeight: 700 }}
          >
            {isRegister ? 'Provision Staff Profile' : 'Access Admin Console'}
          </Button>
        </form>
      </div>

      {/* Security & Audit Notice */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 20,
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#2563eb' }}>🔒</span> Audited Dispatch Access
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#2563eb' }}>🛡️</span> Role-Based Access Control (RBAC)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#2563eb' }}>⚡</span> Spring Security 6 & JWT
        </div>
      </div>

      {/* Role Navigation Switchers */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.8125rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px 8px',
            }}
          >
            &larr; Customer Client Portal
          </button>

          <span style={{ color: '#cbd5e1' }}>•</span>

          <button
            type="button"
            onClick={() => onNavigate('/technician')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px 8px',
            }}
          >
            Technician & Worker Portal &rarr;
          </button>

          <span style={{ color: '#cbd5e1' }}>•</span>

          <button
            type="button"
            onClick={() => onNavigate('/track')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            Public Ticket Lookup
          </button>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
          OmniFix Enterprise Service Platform • Spring Boot Core
        </div>
      </div>
    </div>
  );
}
