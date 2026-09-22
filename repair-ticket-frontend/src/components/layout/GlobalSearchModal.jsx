import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { PriorityBadge, StatusBadge } from '../common';

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectTicket,
  onSelectCustomer,
  onSelectDevice,
  onOpenCreateTicket,
  onOpenCreateCustomer,
  onOpenCreateDevice,
}) {
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Load dataset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setLoading(true);
      Promise.all([
        api.getTickets({ size: 50 }).then((res) => res?.content || []).catch(() => []),
        api.getCustomers().catch(() => []),
        api.getDevices().catch(() => []),
      ]).then(([tList, cList, dList]) => {
        setTickets(tList);
        setCustomers(cList);
        setDevices(dList);
        setLoading(false);
      });

      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Filter items based on query
  const matchingTickets = cleanQuery
    ? tickets.filter(
        (t) =>
          t.ticketNumber?.toLowerCase().includes(cleanQuery) ||
          t.issueDescription?.toLowerCase().includes(cleanQuery) ||
          t.customerName?.toLowerCase().includes(cleanQuery) ||
          t.deviceBrand?.toLowerCase().includes(cleanQuery) ||
          t.deviceModel?.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingCustomers = cleanQuery
    ? customers.filter(
        (c) =>
          c.firstName?.toLowerCase().includes(cleanQuery) ||
          c.lastName?.toLowerCase().includes(cleanQuery) ||
          c.email?.toLowerCase().includes(cleanQuery) ||
          c.phoneNumber?.includes(cleanQuery)
      )
    : [];

  const matchingDevices = cleanQuery
    ? devices.filter(
        (d) =>
          d.brand?.toLowerCase().includes(cleanQuery) ||
          d.model?.toLowerCase().includes(cleanQuery) ||
          d.serialNumber?.toLowerCase().includes(cleanQuery)
      )
    : [];

  const hasMatches = matchingTickets.length > 0 || matchingCustomers.length > 0 || matchingDevices.length > 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalZoomIn 0.16s ease',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search tickets, customers, devices, or serial numbers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flexGrow: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: '#0f172a',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />

          <kbd
            style={{
              padding: '2px 6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results / Quick Actions Scroll Area */}
        <div style={{ maxHeight: 420, overflowY: 'auto', padding: 12 }}>
          {/* Default Quick Actions */}
          {!cleanQuery && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '6px 10px', letterSpacing: '0.04em' }}>
                Quick Actions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  onClick={() => {
                    onClose();
                    if (onOpenCreateTicket) onOpenCreateTicket();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#2563eb' }}>+</span>
                  <span>Dispatch New Repair Ticket</span>
                </div>

                <div
                  onClick={() => {
                    onClose();
                    if (onOpenCreateCustomer) onOpenCreateCustomer();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#059669' }}>+</span>
                  <span>Register Customer Account</span>
                </div>

                <div
                  onClick={() => {
                    onClose();
                    if (onOpenCreateDevice) onOpenCreateDevice();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ color: '#d97706' }}>+</span>
                  <span>Register Hardware Device Unit</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {cleanQuery && !hasMatches && (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
              No matches found for "{query}".
            </div>
          )}

          {/* Matching Tickets */}
          {matchingTickets.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '6px 10px' }}>
                Repair Tickets ({matchingTickets.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchingTickets.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      if (onSelectTicket) onSelectTicket(t);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.8125rem' }}>
                          {t.ticketNumber}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                          {t.deviceBrand} {t.deviceModel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                        Client: {t.customerName} • {t.issueDescription}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PriorityBadge priority={t.priority} size="sm" />
                      <StatusBadge status={t.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Customers */}
          {matchingCustomers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '6px 10px' }}>
                Customers ({matchingCustomers.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchingCustomers.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      if (onSelectCustomer) onSelectCustomer(c);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                        {c.firstName} {c.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                        {c.email} {c.phoneNumber ? `• ${c.phoneNumber}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
                      View Client →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Devices */}
          {matchingDevices.length > 0 && (
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', padding: '6px 10px' }}>
                Hardware Units ({matchingDevices.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchingDevices.slice(0, 4).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      if (onSelectDevice) onSelectDevice(d);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a' }}>
                        {d.brand} {d.model}
                      </div>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>
                        S/N: {d.serialNumber || 'N/A'} • Owner ID #{d.customerId}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
                      View Unit →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
