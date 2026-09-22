import React from 'react';

/**
 * Enterprise Form Input Primitive
 * Includes explicit label, helper text, required indicator, and field-specific error.
 */
export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  icon = null,
  rightElement = null,
  className = '',
  style = {},
  autoComplete,
  ...props
}) {
  const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-field-wrap ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: error ? '#dc2626' : '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {label}
          {required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            height: 38,
            paddingLeft: icon ? '34px' : '12px',
            paddingRight: rightElement ? '36px' : '12px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            color: '#0f172a',
            background: disabled ? '#f8fafc' : '#ffffff',
            border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
            borderRadius: 6,
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#2563eb';
            e.target.style.boxShadow = error
              ? '0 0 0 3px rgba(239, 68, 68, 0.15)'
              : '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#cbd5e1';
            e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
          }}
          {...props}
        />

        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              zIndex: 2,
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {error}
        </div>
      ) : helperText ? (
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
