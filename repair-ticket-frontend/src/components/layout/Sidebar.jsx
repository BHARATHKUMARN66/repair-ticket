import React from 'react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';

/**
 * Enterprise Left Sidebar Navigation for Staff / Admin / Technician
 */
export function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const { user, isAdmin, isTechnician, logout } = useAuth();

  const adminNavItems = [
    {
      id: 'tickets',
      label: 'Repair Tickets',
      subtitle: 'Dispatch & Work Orders',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      id: 'customers',
      label: 'Customers CRM',
      subtitle: 'Accounts & Clients',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      id: 'devices',
      label: 'Hardware Devices',
      subtitle: 'Customer Inventory',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      id: 'technicians',
      label: 'Technician Roster',
      subtitle: 'Bench Workforce',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      id: 'tracker',
      label: 'Public Tracker',
      subtitle: 'Client Lookup Tool',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
  ];

  const techNavItems = [
    {
      id: 'technician-bench',
      label: 'My Workbench',
      subtitle: 'Assigned Bench Queue',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      ),
    },
    {
      id: 'available-pool',
      label: 'Available Pool',
      subtitle: 'Claim Open Repairs',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7.5" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      ),
    },
    {
      id: 'tickets',
      label: 'All Tickets Queue',
      subtitle: 'Shop Floor Tickets',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      ),
    },
    {
      id: 'tracker',
      label: 'Public Tracker',
      subtitle: 'Client Lookup Tool',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
  ];

  const items = isAdmin ? adminNavItems : techNavItems;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90,
            display: 'none',
          }}
          className="sidebar-mobile-backdrop"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          width: 240,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 95,
          userSelect: 'none',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 64,
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <BrandLogo
            onClick={() => setActiveTab(isAdmin ? 'tickets' : 'technician-bench')}
            badgeText={isAdmin ? 'Staff' : 'Tech'}
            badgeVariant={isAdmin ? 'admin' : 'tech'}
          />

          {/* Close on Mobile */}
          <button
            onClick={onClose}
            type="button"
            className="sidebar-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4,
            }}
            aria-label="Close sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Section Label */}
        <div style={{ padding: '16px 18px 6px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8' }}>
          Operations Console
        </div>

        {/* Navigation Items */}
        <nav style={{ flexGrow: 1, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: 'none',
                  borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#2563eb' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                <div style={{ color: isActive ? '#2563eb' : '#64748b', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Mini Profile & System Info Footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
          {user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 6,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                marginBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.fullName || user.username}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                    {isAdmin ? 'Administrator' : isTechnician ? 'Technician' : 'Customer'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 4,
                  transition: 'color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b' }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
              }}
            />
            <span style={{ fontWeight: 600 }}>Core API Connected</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 2 }}>
            Spring Boot 4.1 • PostgreSQL
          </div>
        </div>
      </aside>
    </>
  );
}
