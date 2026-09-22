import React from 'react';

/**
 * Format timestamp into concise relative elapsed age (e.g., '15m ago', '3h ago', '2d ago').
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'N/A';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

/**
 * AgeBadge Component
 * Compact indicator displaying how long a ticket has been active,
 * with subtle warning color for aged/overdue tickets.
 */
export function AgeBadge({ date, priority = 'MEDIUM', isClosed = false }) {
  if (!date) return <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>—</span>;

  const past = new Date(date);
  const diffHours = (new Date() - past) / (1000 * 60 * 60);
  const text = formatTimeAgo(date);

  // Check SLA thresholds
  let isOverdue = false;
  let isWarning = false;

  if (!isClosed) {
    if (priority === 'URGENT' && diffHours > 12) isOverdue = true;
    else if (priority === 'HIGH' && diffHours > 24) isOverdue = true;
    else if (diffHours > 72) isOverdue = true;
    else if (diffHours > 24) isWarning = true;
  }

  let color = '#64748b';
  let bg = '#f1f5f9';
  let border = '#e2e8f0';

  if (isOverdue) {
    color = '#dc2626';
    bg = '#fef2f2';
    border = '#fecaca';
  } else if (isWarning) {
    color = '#d97706';
    bg = '#fffbeb';
    border = '#fde68a';
  }

  return (
    <span
      title={new Date(date).toLocaleString()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: '0.72rem',
        fontWeight: 600,
        color,
        background: bg,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      {text}
    </span>
  );
}
