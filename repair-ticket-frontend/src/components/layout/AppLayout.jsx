import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

/**
 * Global Enterprise Application Shell
 * Wraps content with Topbar, Left Sidebar (for staff/admin/tech), and minimal footer.
 */
export function AppLayout({
  activeTab,
  setActiveTab,
  onNavigate,
  onOpenGlobalSearch,
  children,
}) {
  const { isAuthenticated, isAdmin, isTechnician } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Staff and Technicians get the enterprise left sidebar
  const hasSidebar = isAuthenticated && (isAdmin || isTechnician);

  return (
    <div
      className="app-shell-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
        color: '#0f172a',
      }}
    >
      {/* Left Sidebar for Authenticated Staff/Admin */}
      {hasSidebar && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Column */}
      <div
        className="app-shell-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        {/* Topbar Header */}
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNavigate={onNavigate}
          onOpenGlobalSearch={onOpenGlobalSearch}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          showSidebarToggle={hasSidebar}
        />

        {/* Page Main Content Container */}
        <main
          className="app-content-area"
          style={{
            flexGrow: 1,
            width: '100%',
            maxWidth: 1280,
            margin: '0 auto',
            padding: '24px 24px 48px',
          }}
        >
          {children}
        </main>

        {/* Minimal Enterprise Footer */}
        <footer
          style={{
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '14px 24px',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>OmniFix Service Management Platform • Spring Boot Core</span>
            </div>
            <div>© 2026 OmniFix Inc. All rights reserved.</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
