import React from 'react';

/**
 * Enterprise Consistent Page Header Component
 * Provides Page Title, Section Subtitle, Breadcrumb, and Action Buttons CTA.
 */
export function PageHeader({
  title,
  subtitle,
  badge = null,
  actions = null,
  breadcrumb = null,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`page-header-wrap ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        ...style,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {breadcrumb && (
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            {breadcrumb}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '1.75rem', // 28px
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: 0,
              maxWidth: 680,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
