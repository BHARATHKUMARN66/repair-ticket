import React from 'react';

/**
 * Enterprise Surface Card Container
 */
export function Card({
  children,
  header,
  footer,
  title,
  subtitle,
  actions,
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  onClick,
  hoverable = false,
  ...props
}) {
  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'sm': return '12px 16px';
      case 'lg': return '24px';
      case 'md':
      default: return '16px 20px';
    }
  };

  return (
    <div
      className={`card-primitive ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
        transition: 'all 150ms ease',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {(header || title) && (
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fafafa',
          }}
        >
          {header || (
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>
              {subtitle && <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>{subtitle}</p>}
            </div>
          )}
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
        </div>
      )}

      <div style={{ padding: getPadding() }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
