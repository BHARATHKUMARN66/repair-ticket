import React from 'react';

/**
 * Enterprise Form Select Primitive
 */
export function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  style = {},
  ...props
}) {
  const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-field-wrap ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={selectId}
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
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          style={{
            width: '100%',
            height: 38,
            padding: '0 32px 0 12px',
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            color: value ? '#0f172a' : '#64748b',
            background: disabled ? '#f8fafc' : '#ffffff',
            border: `1px solid ${error ? '#ef4444' : '#cbd5e1'}`,
            borderRadius: 6,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
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
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Indicator */}
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
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
