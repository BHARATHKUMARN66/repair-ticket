import React from 'react';

/**
 * Enterprise Semantic Priority Badge
 * Prioritization: LOW | MEDIUM | HIGH | URGENT
 */
export function PriorityBadge({ priority, size = 'md', className = '', style = {} }) {
  const getPriorityConfig = (p) => {
    switch (p) {
      case 'URGENT':
        return {
          label: 'Urgent',
          bg: '#fef2f2',
          text: '#b91c1c',
          border: '#fecaca',
          indicator: '⚡',
        };
      case 'HIGH':
        return {
          label: 'High',
          bg: '#fff7ed',
          text: '#c2410c',
          border: '#ffedd5',
          indicator: '●',
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          bg: '#f0f9ff',
          text: '#0369a1',
          border: '#e0f2fe',
          indicator: '●',
        };
      case 'LOW':
      default:
        return {
          label: 'Low',
          bg: '#f8fafc',
          text: '#475569',
          border: '#e2e8f0',
          indicator: '○',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={`priority-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: size === 'sm' ? '2px 7px' : '3px 9px',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        borderRadius: 4,
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        ...style,
      }}
    >
      <span style={{ fontSize: size === 'sm' ? '0.65rem' : '0.7rem', opacity: 0.85 }}>{config.indicator}</span>
      {config.label}
    </span>
  );
}
