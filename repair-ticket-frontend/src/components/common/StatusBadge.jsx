import React from 'react';

/**
 * Enterprise Semantic Status Badge
 * Maps backend ticket statuses to consistent, accessible color tokens.
 */
export function StatusBadge({ status, size = 'md', showDot = true, className = '', style = {} }) {
  const getStatusConfig = (st) => {
    switch (st) {
      case 'OPEN':
        return {
          label: 'Open (Intake)',
          bg: '#eff6ff',
          text: '#1d4ed8',
          border: '#bfdbfe',
          dot: '#3b82f6',
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          bg: '#f5f3ff',
          text: '#6d28d9',
          border: '#ddd6fe',
          dot: '#8b5cf6',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          bg: '#fffbeb',
          text: '#b45309',
          border: '#fde68a',
          dot: '#f59e0b',
        };
      case 'REPAIR_COMPLETED':
        return {
          label: 'Repair Complete',
          bg: '#ecfdf5',
          text: '#047857',
          border: '#a7f3d0',
          dot: '#10b981',
        };
      case 'CLOSED':
        return {
          label: 'Closed / Picked Up',
          bg: '#f1f5f9',
          text: '#475569',
          border: '#cbd5e1',
          dot: '#64748b',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bg: '#fef2f2',
          text: '#b91c1c',
          border: '#fecaca',
          dot: '#ef4444',
        };
      default:
        return {
          label: st ? st.replace(/_/g, ' ') : 'Unknown',
          bg: '#f8fafc',
          text: '#475569',
          border: '#e2e8f0',
          dot: '#94a3b8',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        borderRadius: 9999,
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {showDot && (
        <span
          style={{
            width: size === 'sm' ? 5 : 6,
            height: size === 'sm' ? 5 : 6,
            borderRadius: '50%',
            background: config.dot,
            flexShrink: 0,
          }}
        />
      )}
      {config.label}
    </span>
  );
}
