import React from 'react';

/**
 * Compact Operational KPI StatCard Primitive
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  badge,
  badgeType = 'info',
  onClick,
  active = false,
  className = '',
  style = {},
}) {
  return (
    <div
      onClick={onClick}
      className={`stat-card-primitive ${onClick ? 'interactive' : ''} ${active ? 'active' : ''} ${className}`}
      style={{
        background: '#ffffff',
        border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`,
        borderRadius: 8,
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: active
          ? '0 0 0 2px rgba(37, 99, 235, 0.2), 0 2px 4px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 150ms ease',
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, fontFamily: 'inherit' }}>
          {value}
        </div>
        {(subtitle || badge) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            {badge && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 4,
                  background:
                    badgeType === 'success' ? '#ecfdf5' :
                    badgeType === 'warning' ? '#fffbeb' :
                    badgeType === 'danger' ? '#fef2f2' : '#eff6ff',
                  color:
                    badgeType === 'success' ? '#047857' :
                    badgeType === 'warning' ? '#b45309' :
                    badgeType === 'danger' ? '#b91c1c' : '#1d4ed8',
                }}
              >
                {badge}
              </span>
            )}
            {subtitle && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</span>}
          </div>
        )}
      </div>

      {icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
