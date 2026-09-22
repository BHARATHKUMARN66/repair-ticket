import React from 'react';

/**
 * AttentionRequired Component
 * Compact, actionable cards highlighting operational bottlenecks:
 * - Tickets awaiting technician assignment
 * - Overdue SLA / High urgency units
 * - Units completed and awaiting customer collection
 */
export function AttentionRequired({ tickets = [], onSelectFilter, currentFilter }) {
  const needsAssignmentCount = tickets.filter(
    (t) => t.status === 'OPEN' && !t.technicianId && !t.assignedTechnicianId
  ).length;

  const overdueSlaCount = tickets.filter((t) => {
    if (['CLOSED', 'CANCELLED'].includes(t.status)) return false;
    if (t.priority === 'URGENT') return true;
    if (!t.createdAt) return false;
    const diffHours = (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60);
    return t.priority === 'HIGH' && diffHours > 24;
  }).length;

  const readyPickupCount = tickets.filter(
    (t) => t.status === 'REPAIR_COMPLETED'
  ).length;

  const activeRepairCount = tickets.filter(
    (t) => t.status === 'IN_PROGRESS'
  ).length;

  const cards = [
    {
      id: 'NEEDS_ASSIGNMENT',
      label: 'Needs Assignment',
      count: needsAssignmentCount,
      desc: 'Intake tickets without assigned specialist',
      badge: 'Immediate Action',
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7.5" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
      ),
    },
    {
      id: 'OVERDUE_SLA',
      label: 'Overdue / SLA Alerts',
      count: overdueSlaCount,
      desc: 'Urgent & high priority tickets past target window',
      badge: 'SLA Risk',
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fecaca',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ),
    },
    {
      id: 'IN_REPAIR',
      label: 'In Bench Repair',
      count: activeRepairCount,
      desc: 'Hardware currently on active diagnostic benches',
      badge: 'Bench Active',
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      id: 'READY_PICKUP',
      label: 'Ready for Pickup',
      count: readyPickupCount,
      desc: 'QA completed; waiting for customer handover',
      badge: 'Ready',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Attention Required
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Click any category to filter queue)
          </span>
        </div>
        {currentFilter && (
          <button
            type="button"
            onClick={() => onSelectFilter(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 6px',
            }}
          >
            Clear Alert Filter ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 12,
        }}
      >
        {cards.map((card) => {
          const isActive = currentFilter === card.id;
          return (
            <div
              key={card.id}
              onClick={() => onSelectFilter(isActive ? null : card.id)}
              style={{
                background: isActive ? card.bg : '#ffffff',
                border: `1.5px solid ${isActive ? card.color : card.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isActive
                  ? '0 4px 6px -1px rgba(0,0,0,0.06)'
                  : '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = card.border;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: card.color }}>
                  {card.icon}
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {card.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: card.color,
                    lineHeight: 1,
                  }}
                >
                  {card.count}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.35 }}>
                {card.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
