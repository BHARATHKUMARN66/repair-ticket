import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, onOpenCustomerAuth, onOpenAdminAuth }) {
  const { user, isAuthenticated, logout, isAdmin, isTechnician } = useAuth();
  const isCustomer = isAuthenticated && !isAdmin && !isTechnician;

  const getPortalLabel = () => {
    if (isAdmin) return { label: 'Admin Console', class: 'badge-urgent' };
    if (isTechnician) return { label: 'Bench Ops', class: 'badge-inprogress' };
    if (isCustomer) return { label: 'Client Portal', class: 'badge-open' };
    return { label: 'Service Desk', class: 'badge-open' };
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xs)',
      height: 64,
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab(isCustomer ? 'customer-portal' : isTechnician ? 'technician-bench' : 'tickets')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                OmniFix
              </span>
              <span className={`badge ${getPortalLabel().class}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}>
                {getPortalLabel().label}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Smart Repair & Service Hub
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs (Role Segregated) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {/* Guest Navigation */}
          {!isAuthenticated && (
            <button 
              className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('tracker')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Track Repair
            </button>
          )}

          {/* Customer Navigation: Strictly Client Views */}
          {isCustomer && (
            <>
              <button 
                className={`btn btn-sm ${activeTab === 'customer-portal' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('customer-portal')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                My Portal & Repairs
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tracker')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Public Tracker
              </button>
            </>
          )}

          {/* Technician Navigation */}
          {isTechnician && (
            <>
              <button 
                className={`btn btn-sm ${activeTab === 'technician-bench' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('technician-bench')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                My Bench
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tickets')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                All Tickets
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tracker')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Tracker
              </button>
            </>
          )}

          {/* Admin Navigation: Full Oversight */}
          {isAdmin && (
            <>
              <button 
                className={`btn btn-sm ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tickets')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                Tickets Queue
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('customers')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Customers CRM
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'devices' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('devices')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line></svg>
                Devices
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'technicians' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('technicians')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Technicians
              </button>

              <button 
                className={`btn btn-sm ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('tracker')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Tracker
              </button>
            </>
          )}
        </nav>

        {/* Right Section: User Profile or Split Login Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--bg-surface-subtle)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isCustomer ? 'var(--color-info)' : 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.fullName || user.username}
                </span>
                <span className={`badge ${
                  isAdmin ? 'badge-urgent' : isTechnician ? 'badge-assigned' : 'badge-open'
                }`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {isAdmin ? 'ADMIN' : isTechnician ? 'TECHNICIAN' : 'CUSTOMER'}
                </span>
              </div>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Sign out of your account"
                style={{ padding: '0 0.6rem' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          ) : (
            /* Split Login Buttons for Guests */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-sm btn-primary"
                onClick={onOpenCustomerAuth}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Customer Sign In
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={onOpenAdminAuth}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Staff Console
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
