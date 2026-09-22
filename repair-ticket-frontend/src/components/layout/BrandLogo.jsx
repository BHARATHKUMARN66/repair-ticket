import React from 'react';

/**
 * Enterprise Brand Logo Component
 * OmniFix: Smart Repair & Service Hub
 */
export function BrandLogo({ onClick, collapsed = false, badgeText = null, badgeVariant = 'default', size = 'md' }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: size === 'sm' ? 30 : 36,
          height: size === 'sm' ? 30 : 36,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
        }}
      >
        <svg width={size === 'sm' ? 16 : 18} height={size === 'sm' ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontSize: size === 'sm' ? '1.05rem' : '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              OmniFix
            </span>
            {badgeText && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: 4,
                  background:
                    badgeVariant === 'admin' ? '#fef2f2' :
                    badgeVariant === 'tech' ? '#fffbeb' :
                    badgeVariant === 'client' ? '#eff6ff' : '#f1f5f9',
                  color:
                    badgeVariant === 'admin' ? '#dc2626' :
                    badgeVariant === 'tech' ? '#b45309' :
                    badgeVariant === 'client' ? '#2563eb' : '#475569',
                  border: `1px solid ${
                    badgeVariant === 'admin' ? '#fecaca' :
                    badgeVariant === 'tech' ? '#fde68a' :
                    badgeVariant === 'client' ? '#bfdbfe' : '#e2e8f0'
                  }`,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 500, lineHeight: 1.1 }}>
            Smart Repair & Service Hub
          </span>
        </div>
      )}
    </div>
  );
}
