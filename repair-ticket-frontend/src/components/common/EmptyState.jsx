import React from 'react';
import { Button } from './Button';

/**
 * Enterprise Empty State Primitive
 */
export function EmptyState({
  title = 'No records found',
  description = 'There are no items to display right now.',
  icon = null,
  actionLabel = null,
  onAction = null,
  secondaryActionLabel = null,
  onSecondaryAction = null,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        border: '1px dashed #cbd5e1',
        borderRadius: 8,
        ...style,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        {icon || (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )}
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 400, margin: '0 0 18px', lineHeight: 1.5 }}>
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {secondaryActionLabel && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
