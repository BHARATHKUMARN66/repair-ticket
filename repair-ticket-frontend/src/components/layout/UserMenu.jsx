import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * Enterprise User Profile Dropdown Menu
 */
export function UserMenu() {
  const { user, logout, isAdmin, isTechnician } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Admin', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    if (isTechnician) return { label: 'Technician', bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    return { label: 'Customer', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
  };

  const role = getRoleBadge();
  const initial = user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: isOpen ? '#f1f5f9' : '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          padding: '4px 10px 4px 5px',
          cursor: 'pointer',
          transition: 'all 120ms ease',
          outline: 'none',
        }}
        aria-expanded={isOpen}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: isAdmin ? '#dc2626' : isTechnician ? '#d97706' : '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {initial}
        </div>

        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.15, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.fullName || user?.username}
          </span>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: role.text,
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            {role.label}
          </span>
        </div>

        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: 220,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: 6,
            zIndex: 100,
            animation: 'modalZoomIn 0.15s ease',
          }}
        >
          {/* User Header */}
          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              {user?.fullName || user?.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>
              {user?.username ? `@${user.username}` : ''}
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: role.bg,
                  color: role.text,
                  border: `1px solid ${role.border}`,
                }}
              >
                Role: {role.label}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              fontSize: '0.8125rem',
              color: '#334155',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Account Profile
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              fontSize: '0.8125rem',
              color: '#334155',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            System Preferences
          </button>

          <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

          {/* Logout Action */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              fontSize: '0.8125rem',
              color: '#dc2626',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
              fontWeight: 600,
              transition: 'background-color 100ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
