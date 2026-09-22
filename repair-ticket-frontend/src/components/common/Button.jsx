import React from 'react';

/**
 * Enterprise Reusable Button Primitive
 * Variants: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
 * Sizes: 'sm' | 'md' | 'lg'
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  style = {},
  title,
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: '#f1f5f9',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
        };
      case 'outline':
        return {
          background: '#ffffff',
          color: '#334155',
          border: '1px solid #cbd5e1',
        };
      case 'danger':
        return {
          background: '#dc2626',
          color: '#ffffff',
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#475569',
          border: '1px solid transparent',
        };
      case 'primary':
      default:
        return {
          background: '#2563eb',
          color: '#ffffff',
          border: '1px solid transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 32,
          padding: '0 10px',
          fontSize: '0.8125rem',
          borderRadius: 6,
          gap: 6,
        };
      case 'lg':
        return {
          height: 44,
          padding: '0 20px',
          fontSize: '0.9375rem',
          borderRadius: 8,
          gap: 8,
        };
      case 'md':
      default:
        return {
          height: 38,
          padding: '0 14px',
          fontSize: '0.875rem',
          borderRadius: 6,
          gap: 7,
        };
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      className={`btn-primitive btn-${variant} btn-${size} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        fontWeight: 600,
        lineHeight: 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 150ms ease',
        whiteSpace: 'nowrap',
        outline: 'none',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: size === 'sm' ? 12 : 14,
            height: size === 'sm' ? 12 : 14,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginRight: 6,
          }}
        />
      ) : (
        icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
    </button>
  );
}
