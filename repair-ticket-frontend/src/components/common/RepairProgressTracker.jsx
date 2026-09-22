import React from 'react';

/**
 * Stages in the customer-facing repair journey:
 * 1. Request Received (OPEN)
 * 2. Device Received (ASSIGNED / at bench)
 * 3. Diagnosis (IN_PROGRESS - initial inspection)
 * 4. Repair (IN_PROGRESS - hardware work)
 * 5. Quality Check (REPAIR_COMPLETED - testing)
 * 6. Ready for Pickup (REPAIR_COMPLETED / CLOSED)
 */
const CUSTOMER_STAGES = [
  { id: 'REQUEST', label: 'Request Received' },
  { id: 'RECEIVED', label: 'Device Received' },
  { id: 'DIAGNOSIS', label: 'Diagnosis' },
  { id: 'REPAIR', label: 'Repair' },
  { id: 'QA', label: 'Quality Check' },
  { id: 'PICKUP', label: 'Ready for Pickup' },
];

/**
 * Maps backend ticket status to active customer stage index (0-5)
 */
export function getActiveStageIndex(status) {
  switch (status) {
    case 'OPEN':
      return 0; // Request Received
    case 'ASSIGNED':
      return 1; // Device Received / Assigned
    case 'IN_PROGRESS':
      return 3; // Repair in progress
    case 'REPAIR_COMPLETED':
      return 5; // Ready for pickup / passed QA
    case 'CLOSED':
      return 6; // All completed / picked up
    case 'CANCELLED':
      return -1;
    default:
      return 0;
  }
}

export function RepairProgressTracker({ status, compact = false, orientation = 'horizontal' }) {
  if (status === 'CANCELLED') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 6,
          color: '#dc2626',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}
      >
        <span style={{ fontSize: '0.85rem' }}>✕</span>
        <span>Repair Request Cancelled</span>
      </div>
    );
  }

  const activeIndex = getActiveStageIndex(status);

  if (compact) {
    // Compact linear pill for small cards
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
          <span style={{ color: '#64748b' }}>Current Stage:</span>
          <span style={{ fontWeight: 700, color: activeIndex >= 5 ? '#059669' : '#2563eb' }}>
            {activeIndex >= 5
              ? 'Ready for Pickup'
              : CUSTOMER_STAGES[activeIndex]?.label || 'In Progress'}
          </span>
        </div>

        {/* 6 Segment Progress Bar */}
        <div style={{ display: 'flex', gap: 3, height: 5 }}>
          {CUSTOMER_STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            let bg = '#e2e8f0';
            if (isCompleted) bg = '#10b981';
            else if (isCurrent) bg = '#2563eb';

            return (
              <div
                key={stage.id}
                title={`${stage.label} (${isCompleted ? 'Completed' : isCurrent ? 'Active' : 'Upcoming'})`}
                style={{
                  flex: 1,
                  borderRadius: 3,
                  background: bg,
                  transition: 'background 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Full Visual Progress Stepper
  return (
    <div
      className="repair-progress-stepper"
      style={{
        display: 'flex',
        alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        width: '100%',
        margin: '12px 0',
        position: 'relative',
      }}
    >
      {CUSTOMER_STAGES.map((stage, idx) => {
        const isCompleted = idx < activeIndex;
        const isCurrent = idx === activeIndex;
        const isLast = idx === CUSTOMER_STAGES.length - 1;

        return (
          <React.Fragment key={stage.id}>
            <div
              style={{
                display: 'flex',
                flexDirection: orientation === 'vertical' ? 'row' : 'column',
                alignItems: 'center',
                gap: 6,
                flex: orientation === 'vertical' ? 'none' : 1,
                minWidth: orientation === 'vertical' ? '100%' : 70,
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Step Circle / Badge */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  background: isCompleted
                    ? '#10b981'
                    : isCurrent
                    ? '#2563eb'
                    : '#ffffff',
                  color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                  border: isCompleted
                    ? '2px solid #10b981'
                    : isCurrent
                    ? '2px solid #2563eb'
                    : '2px solid #cbd5e1',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
                }}
              >
                {isCompleted ? (
                  '✓'
                ) : isCurrent ? (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#ffffff',
                    }}
                  />
                ) : (
                  idx + 1
                )}
              </div>

              {/* Stage Title */}
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                  color: isCurrent
                    ? '#2563eb'
                    : isCompleted
                    ? '#0f172a'
                    : '#94a3b8',
                  lineHeight: 1.2,
                  maxWidth: 90,
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Connecting Track Line */}
            {!isLast && orientation !== 'vertical' && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: isCompleted ? '#10b981' : '#e2e8f0',
                  margin: '0 -4px 14px',
                  zIndex: 1,
                  transition: 'background 0.2s ease',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
