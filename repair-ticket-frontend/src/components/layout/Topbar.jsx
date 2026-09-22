import React from 'react';
import { BrandLogo } from './BrandLogo';
import { UserMenu } from './UserMenu';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Enterprise Topbar Header
 * Dynamically switches between:
 * 1. Staff/Admin header (Search + Notifications + User Menu)
 * 2. Customer portal header (Logo + Navigation Tabs + User Menu)
 * 3. Guest header (Logo + Route buttons to Customer, Admin, Tech, and Tracker)
 */
export function Topbar({
  activeTab,
  setActiveTab,
  onNavigate,
  onToggleSidebar,
  showSidebarToggle = false,
  onOpenGlobalSearch,
}) {
  const { isAuthenticated, isAdmin, isTechnician } = useAuth();
  const isCustomer = isAuthenticated && !isAdmin && !isTechnician;

  // Global Ctrl/Cmd + K shortcut
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenGlobalSearch) onOpenGlobalSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenGlobalSearch]);

  const handleLogoClick = () => {
    if (isAdmin) {
      if (onNavigate) onNavigate('/admin');
      if (setActiveTab) setActiveTab('tickets');
    } else if (isTechnician) {
      if (onNavigate) onNavigate('/technician');
      if (setActiveTab) setActiveTab('technician-bench');
    } else {
      if (onNavigate) onNavigate('/');
      if (setActiveTab) setActiveTab('customer-portal');
    }
  };

  return (
    <header
      style={{
        height: 64,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="topbar-container"
        style={{
          width: '100%',
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* Left Area: Hamburger (for staff) OR BrandLogo (for customer/guest) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {showSidebarToggle && (
            <button
              type="button"
              onClick={onToggleSidebar}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
              className="sidebar-toggle-btn"
              aria-label="Toggle Navigation Sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          )}

          {(!showSidebarToggle || isCustomer || !isAuthenticated) && (
            <BrandLogo
              onClick={handleLogoClick}
              badgeText={isAdmin ? 'Staff Desk' : isTechnician ? 'Workshop' : isCustomer ? 'Client Portal' : null}
              badgeVariant={isAdmin ? 'admin' : isTechnician ? 'tech' : 'client'}
            />
          )}
        </div>

        {/* Center Navigation for Customers */}
        {isCustomer && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Button
              variant={activeTab === 'customer-portal' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (onNavigate) onNavigate('/');
                if (setActiveTab) setActiveTab('customer-portal');
              }}
            >
              My Repairs & Portal
            </Button>
            <Button
              variant={activeTab === 'tracker' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                if (onNavigate) onNavigate('/track');
                if (setActiveTab) setActiveTab('tracker');
              }}
            >
              Track Repair
            </Button>
          </nav>
        )}

        {/* Center Search for Staff / Admin */}
        {(isAdmin || isTechnician) && (
          <div
            className="topbar-search-wrap"
            style={{
              flexGrow: 1,
              maxWidth: 460,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                readOnly
                onClick={() => onOpenGlobalSearch && onOpenGlobalSearch()}
                placeholder="Search ticket code, customer, or serial number..."
                style={{
                  width: '100%',
                  height: 36,
                  paddingLeft: 32,
                  paddingRight: 60,
                  fontSize: '0.8125rem',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  outline: 'none',
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              />
              <span
                onClick={() => onOpenGlobalSearch && onOpenGlobalSearch()}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  fontSize: '0.6875rem',
                  color: '#64748b',
                  padding: '1px 5px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                }}
              >
                ⌘K
              </span>
            </div>

            <div className="live-status-pill" title="Live REST & PostgreSQL Synchronization Active">
              <span className="live-status-dot" />
              <span>Live Sync</span>
            </div>
          </div>
        )}

        {/* Right Actions: User Menu OR Route Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate && onNavigate('/track')}
              >
                Track Repair
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate && onNavigate('/')}
              >
                Customer Sign In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate && onNavigate('/technician')}
              >
                Technician
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate && onNavigate('/admin')}
              >
                Admin Console
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
