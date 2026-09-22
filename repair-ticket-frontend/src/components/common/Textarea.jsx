import React from 'react';

/**
 * Enterprise Form Textarea Primitive
 * Features character counter, error display, helper text, and accessible focus states.
 */
export function Textarea({
  label,
  id,
  name,
  value = '',
  onChange,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  maxLength = null,
  showCharCount = false,
  error = null,
  helperText = null,
  className = '',
  style = {},
  ...props
}) {
  const textareaId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = value ? value.length : 0;

  return (
    <div className={`form-field-wrap ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label && (
          <label
            htmlFor={textareaId}
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

        {showCharCount && maxLength && (
          <span style={{ fontSize: '0.75rem', color: currentLength > maxLength ? '#dc2626' : '#94a3b8' }}>
            {currentLength} / {maxLength} characters
          </span>
        )}
      </div>

      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          color: '#0f172a',
          background: disabled ? '#f8fafc' : '#ffffff',
          border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
          borderRadius: 6,
          outline: 'none',
          resize: 'vertical',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          lineHeight: 1.5,
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
