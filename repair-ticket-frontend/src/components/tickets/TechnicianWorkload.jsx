import React from 'react';

/**
 * TechnicianWorkload Component
 * Compact team capacity section displaying active technician bench load
 * and allowing one-click filtering to a technician's assigned tasks.
 */
export function TechnicianWorkload({ technicians = [], tickets = [], onSelectTechnician, selectedTechId }) {
  if (!technicians || technicians.length === 0) return null;

  const BENCH_CAPACITY = 5; // standard target concurrent capacity per bench tech

  const techLoads = technicians.map((tech) => {
    const techTickets = tickets.filter(
      (t) => (t.technicianId === tech.id || t.assignedTechnicianId === tech.id)
    );
    const activeTickets = techTickets.filter((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.status));
    const qaTickets = techTickets.filter((t) => t.status === 'REPAIR_COMPLETED');
    const totalAssigned = techTickets.filter((t) => !['CLOSED', 'CANCELLED'].includes(t.status));

    const loadPercent = Math.min(100, Math.round((activeTickets.length / BENCH_CAPACITY) * 100));

    return {
      ...tech,
      activeCount: activeTickets.length,
      qaCount: qaTickets.length,
      totalAssignedCount: totalAssigned.length,
      loadPercent,
    };
  });

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Bench Specialist Capacity & Workload
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            (Click technician to filter queue)
          </span>
        </div>
        {selectedTechId && (
          <button
            type="button"
            onClick={() => onSelectTechnician(null)}
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
            Show All Technicians ✕
          </button>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
        }}
      >
        {techLoads.map((tech) => {
          const isSelected = selectedTechId && Number(selectedTechId) === Number(tech.id);
          const initials = `${tech.firstName?.[0] || 'T'}${tech.lastName?.[0] || ''}`;

          let loadColor = '#10b981'; // green (< 60%)
          if (tech.loadPercent >= 80) loadColor = '#ef4444'; // red (high load)
          else if (tech.loadPercent >= 60) loadColor = '#f59e0b'; // amber

          return (
            <div
              key={tech.id}
              onClick={() => onSelectTechnician(isSelected ? null : tech.id)}
              style={{
                background: isSelected ? '#eff6ff' : '#ffffff',
                border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: 8,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected
                  ? '0 4px 6px -1px rgba(37, 99, 235, 0.08)'
                  : '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: isSelected ? '#2563eb' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', lineHeight: 1.2 }}>
                      {tech.firstName} {tech.lastName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {tech.specialization || 'Hardware Specialist'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {tech.activeCount}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Active
                  </div>
                </div>
              </div>

              {/* Workload Progress Bar */}
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginBottom: 3 }}>
                  <span>Bench Capacity</span>
                  <span style={{ fontWeight: 600, color: loadColor }}>{tech.activeCount}/{BENCH_CAPACITY} units ({tech.loadPercent}%)</span>
                </div>
                <div style={{ width: '100%', height: 5, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${tech.loadPercent}%`,
                      height: '100%',
                      background: loadColor,
                      borderRadius: 999,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Sub metrics */}
              {tech.qaCount > 0 && (
                <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>✓</span> {tech.qaCount} unit(s) awaiting customer pickup
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
