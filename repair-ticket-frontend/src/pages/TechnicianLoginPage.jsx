import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/common';
import { BrandLogo } from '../components/layout/BrandLogo';

export function TechnicianLoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      await login(formData.username.trim(), formData.password);
      // On success, AuthContext updates user/role and App renders Technician Workbench
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify specialist credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas-bg">
      {/* Top Header Branding */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', marginBottom: 12 }}>
          <BrandLogo subtitle="Workshop Specialist Workbench" badgeText="Technician" badgeVariant="tech" />
        </div>
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            Workshop Bench Access
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
        {/* Security Notice: Admin-Only Provisioning */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 14px',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <div style={{ color: '#d97706', marginTop: 1, flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: 2 }}>Authorized Workshop Terminal</strong>
            Specialist accounts are provisioned exclusively by Facility Administrators. Contact your service desk lead to activate or reset your bench login.
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Technician Sign In
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            Sign in with your admin-provisioned staff credentials to access your workbench, claim tickets, and record diagnostic progress.
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
          <Input
            label="Technician Username"
            name="username"
            required
            placeholder="Enter specialist username"
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
            Enter Repair Workbench
          </Button>
        </form>
      </div>

      {/* Workshop Specialist Badges */}
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
          <span style={{ color: '#d97706' }}>🛠️</span> Bench Self-Assignment Pool
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#d97706' }}>⚡</span> Instant Lifecycle Milestones
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ color: '#d97706' }}>🔍</span> Diagnostic Log Recording
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
            onClick={() => onNavigate('/admin')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px 8px',
            }}
          >
            Administrator Console &rarr;
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
