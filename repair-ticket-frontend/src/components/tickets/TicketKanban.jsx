import React from 'react';
import { PriorityBadge, AgeBadge } from '../common';

/**
 * Kanban columns representing the repair lifecycle:
 * Intake -> Assigned -> In Repair / Diagnosing -> QA -> Collected / Closed
 */
const KANBAN_COLUMNS = [
  {
    id: 'OPEN',
    title: 'Intake / Logged',
    subtitle: 'Awaiting triage & allocation',
    color: '#3b82f6',
    headerBg: '#eff6ff',
    badgeBg: '#dbeafe',
  },
  {
    id: 'ASSIGNED',
    title: 'Assigned',
    subtitle: 'Allocated to specialist',
    color: '#8b5cf6',
    headerBg: '#f5f3ff',
    badgeBg: '#ede9fe',
  },
  {
    id: 'IN_PROGRESS',
    title: 'Bench Repair / Diagnosis',
    subtitle: 'Active hardware servicing',
    color: '#f59e0b',
    headerBg: '#fffbeb',
    badgeBg: '#fef3c7',
  },
  {
    id: 'REPAIR_COMPLETED',
    title: 'Quality Check / QA',
    subtitle: 'Passed inspection; ready for pickup',
    color: '#10b981',
    headerBg: '#ecfdf5',
    badgeBg: '#d1fae5',
  },
  {
    id: 'CLOSED',
    title: 'Collected / Dispatched',
    subtitle: 'Fulfilled & closed orders',
    color: '#64748b',
    headerBg: '#f8fafc',
    badgeBg: '#e2e8f0',
  },
];

export function TicketKanban({ tickets = [], onSelectTicket, onOpenCreateTicket }) {
  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toUpperCase();
    if (type === 'LAPTOP') return '💻';
    if (type === 'SMARTPHONE') return '📱';
    if (type === 'TABLET') return '📟';
    if (type === 'DESKTOP') return '🖥️';
    return '🔧';
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        paddingBottom: 16,
        alignItems: 'flex-start',
        minHeight: 520,
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            style={{
              flex: '1 1 300px',
              minWidth: 280,
              maxWidth: 340,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 240px)',
            }}
          >
            {/* Column Header */}
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid #e2e8f0',
                background: col.headerBg,
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: col.color,
                    }}
                  />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                    {col.title}
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 1 }}>
                  {col.subtitle}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: col.color,
                  background: col.badgeBg,
                  padding: '2px 8px',
                  borderRadius: 9999,
                }}
              >
                {colTickets.length}
              </span>
            </div>

            {/* Column Card List */}
            <div
              style={{
                padding: 10,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                flexGrow: 1,
              }}
            >
              {colTickets.length === 0 ? (
                <div
                  style={{
                    padding: '28px 12px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    border: '1.5px dashed #e2e8f0',
                    borderRadius: 6,
                    margin: 4,
                  }}
                >
                  No tickets in {col.title.toLowerCase()}
                </div>
              ) : (
                colTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => onSelectTicket(ticket)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: 12,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563eb';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37,99,235,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                    }}
                  >
                    {/* Top Row: Ticket Code & Priority */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#2563eb',
                        }}
                      >
                        {ticket.ticketNumber}
                      </span>
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </div>

                    {/* Hardware Unit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1rem' }}>{getDeviceIcon(ticket.deviceType)}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.2 }}>
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </span>
                    </div>

                    {/* Reported Issue snippet */}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#475569',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {ticket.issueDescription}
                    </div>

                    {/* Divider */}
                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '2px 0' }} />

                    {/* Footer Row: Customer, Specialist & Age */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        <strong style={{ color: '#334155' }}>{ticket.customerName}</strong>
                      </div>

                      <AgeBadge date={ticket.createdAt} priority={ticket.priority} isClosed={ticket.status === 'CLOSED'} />
                    </div>

                    {/* Technician attribution chip */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: '#94a3b8' }}>Specialist:</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: ticket.technicianId || ticket.assignedTechnicianId ? '#0f172a' : '#d97706',
                          background: ticket.technicianId || ticket.assignedTechnicianId ? '#f1f5f9' : '#fffbeb',
                          padding: '1px 6px',
                          borderRadius: 4,
                          border: `1px solid ${ticket.technicianId || ticket.assignedTechnicianId ? '#e2e8f0' : '#fde68a'}`,
                        }}
                      >
                        {ticket.technicianName || ticket.assignedTechnicianName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
