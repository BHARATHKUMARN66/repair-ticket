import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Button, Card, StatusBadge, PriorityBadge } from './common';

const LIFECYCLE_STEPS = [
  { id: 'REQUEST', label: 'Request Received', desc: 'Logged on portal' },
  { id: 'RECEIVED', label: 'Device Received', desc: 'At service counter' },
  { id: 'DIAGNOSIS', label: 'Diagnosis', desc: 'Hardware inspection' },
  { id: 'REPAIR', label: 'Repair', desc: 'Active hardware work' },
  { id: 'QA', label: 'Quality Check', desc: 'Testing & verification' },
  { id: 'PICKUP', label: 'Ready for Pickup', desc: 'Awaiting pickup' },
];

export function PublicTracker({ onSelectTicket, initialTicketNumber = '' }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialTicketNumber) {
      setTrackingNumber(initialTicketNumber);
      handleSearch(initialTicketNumber);
    }
  }, [initialTicketNumber]);

  const handleSearch = async (ticketNum) => {
    const queryNumber = (ticketNum || trackingNumber).trim();
    if (!queryNumber) return;

    if (ticketNum) setTrackingNumber(ticketNum);

    setLoading(true);
    setError(null);
    setTicket(null);
    setUpdates([]);

    try {
      const data = await api.getTicketByNumber(queryNumber);
      setTicket(data);

      try {
        const updateList = await api.getPublicTicketUpdates(data.ticketNumber || queryNumber);
        setUpdates(updateList || []);
      } catch (err) {
        try {
          const fallbackList = await api.getTicketUpdates(data.id);
          setUpdates(fallbackList || []);
        } catch (innerErr) {
          console.warn('Could not load ticket updates:', innerErr);
        }
      }
    } catch (err) {
      setError(`No service ticket found for code "${queryNumber}". Please verify your ticket code and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskSerialNumber = (sn) => {
    if (!sn || sn.length <= 4) return sn || 'N/A';
    return `***${sn.slice(-4)}`;
  };

  const maskCustomerName = (fullName) => {
    if (!fullName) return 'Valued Customer';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  const getDeviceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('laptop') || t.includes('macbook') || t.includes('notebook')) return '💻';
    if (t.includes('phone') || t.includes('iphone') || t.includes('android')) return '📱';
    if (t.includes('tablet') || t.includes('ipad')) return '📟';
    if (t.includes('desktop') || t.includes('pc') || t.includes('workstation')) return '🖥️';
    return '⚙️';
  };

  const getLifecycleState = (stepId, currentStatus) => {
    if (currentStatus === 'CANCELLED') return 'cancelled';

    let currentIdx = 0;
    if (currentStatus === 'OPEN') currentIdx = 0;
    else if (currentStatus === 'ASSIGNED') currentIdx = 1;
    else if (currentStatus === 'IN_PROGRESS') currentIdx = 3;
    else if (currentStatus === 'REPAIR_COMPLETED') currentIdx = 5;
    else if (currentStatus === 'CLOSED') currentIdx = 6;

    const stepIds = ['REQUEST', 'RECEIVED', 'DIAGNOSIS', 'REPAIR', 'QA', 'PICKUP'];
    const stepIdx = stepIds.indexOf(stepId);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const getEstimatedCompletion = (t) => {
    if (!t?.createdAt) return 'Pending triage';
    const date = new Date(t.createdAt);
    let daysToAdd = 3;
    if (t.priority === 'URGENT') daysToAdd = 1;
    else if (t.priority === 'HIGH') daysToAdd = 2;
    else if (t.priority === 'MEDIUM') daysToAdd = 3;
    else daysToAdd = 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getProgressPercentage = (status) => {
    if (status === 'CANCELLED') return 0;
    if (status === 'OPEN') return 16;
    if (status === 'ASSIGNED') return 33;
    if (status === 'IN_PROGRESS') return 66;
    if (status === 'REPAIR_COMPLETED') return 90;
    if (status === 'CLOSED') return 100;
    return 10;
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '12px 0 36px' }}>
      {/* Service Lookup Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, marginBottom: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
          OmniFix Live Service Tracker
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
          Track Your Hardware Repair
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.5 }}>
          Enter your repair ticket number to see the latest repair status and diagnostic updates.
        </p>
      </div>

      {/* Lookup Card */}
      <Card style={{ padding: '22px 26px', marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
        >
          <div style={{ flexGrow: 1, minWidth: 260, position: 'relative' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2.2"
              style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TICK-20260911-0A15E953"
              style={{
                width: '100%',
                height: 44,
                padding: '0 36px 0 42px',
                fontSize: '0.9375rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: 8,
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
              }}
            />
            {trackingNumber && (
              <button
                type="button"
                onClick={() => setTrackingNumber('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  lineHeight: 1,
                  padding: 4,
                  borderRadius: '50%',
                }}
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            style={{ height: 44, padding: '0 24px', fontWeight: 700, borderRadius: 8 }}
          >
            Track Repair
          </Button>
        </form>

        {/* Quick Lookup Examples */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
          <span style={{ fontWeight: 600 }}>Try Demo Ticket Codes:</span>
          <button
            type="button"
            onClick={() => handleSearch('TICK-20260911-0A15E953')}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px', color: '#2563eb', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}
          >
            TICK-20260911-0A15E953
          </button>
          <button
            type="button"
            onClick={() => handleSearch('TICK-20260911-831C57BC')}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 9px', color: '#2563eb', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600 }}
          >
            TICK-20260911-831C57BC
          </button>
        </div>
      </Card>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 8,
            padding: '14px 18px',
            marginBottom: 20,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>{error}</div>
        </div>
      )}

      {/* Loaded Ticket Overview */}
      {ticket && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Summary Card */}
          <Card padding="none">
            {/* Ticket Card Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {getDeviceIcon(ticket.deviceType)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                      {ticket.ticketNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ticket.ticketNumber)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 2 }}
                      title="Copy tracking code"
                    >
                      {copied ? (
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Copied!</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Device: <strong style={{ color: '#1e293b' }}>{ticket.deviceBrand} {ticket.deviceModel}</strong> ({ticket.deviceType || 'Hardware'})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            {/* Cancelled Notice if applicable */}
            {ticket.status === 'CANCELLED' && (
              <div
                style={{
                  background: '#fef2f2',
                  borderBottom: '1px solid #fecaca',
                  padding: '14px 24px',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <div>
                  <strong>Service Cancelled:</strong> This repair ticket was cancelled by the customer. No further bench actions are pending.
                </div>
              </div>
            )}

            {/* Lifecycle Progress Stepper */}
            {ticket.status !== 'CANCELLED' && (
              <div style={{ padding: '24px 28px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                    Repair Lifecycle Milestones
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563eb' }}>
                    {getProgressPercentage(ticket.status)}% Completed
                  </div>
                </div>

                <div
                  className="lifecycle-stepper"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  {LIFECYCLE_STEPS.map((st, idx) => {
                    const state = getLifecycleState(st.id, ticket.status);
                    const isCompleted = state === 'completed';
                    const isCurrent = state === 'current';

                    return (
                      <div
                        key={st.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {/* Step Marker */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            marginBottom: 8,
                            background:
                              isCompleted ? '#10b981' :
                              isCurrent ? '#2563eb' : '#ffffff',
                            color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                            border: `2px solid ${
                              isCompleted ? '#10b981' :
                              isCurrent ? '#2563eb' : '#cbd5e1'
                            }`,
                            boxShadow: isCurrent ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0,0,0,0.04)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                            color: isCurrent ? '#2563eb' : isCompleted ? '#0f172a' : '#94a3b8',
                            lineHeight: 1.25,
                          }}
                        >
                          {st.label}
                        </div>

                        <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 3 }}>
                          {st.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Information Details Grid */}
            <div
              style={{
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client Contact</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {maskCustomerName(ticket.customerName)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hardware Serial No.</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace', marginTop: 2 }}>
                  {maskSerialNumber(ticket.deviceSerialNumber)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assigned Specialist</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: ticket.technicianName ? '#0f172a' : '#64748b', marginTop: 2 }}>
                  {ticket.technicianName ? `Specialist ${ticket.technicianName}` : 'Intake / Pending Allocation'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Service Facility</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  OmniFix Central Lab
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Logged Date</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Expected Turnaround</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#2563eb', marginTop: 2 }}>
                  {ticket.priority === 'URGENT' ? '24 Hours (Urgent SLA)' : ticket.priority === 'HIGH' ? '1–2 Business Days' : '3–5 Business Days'}
                </div>
              </div>
            </div>

            {/* Reported Symptom Box */}
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                Reported Issue & Symptoms
              </div>
              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {ticket.issueDescription}
              </div>
            </div>
          </Card>

          {/* Latest Update Callout Card */}
          {updates && updates.length > 0 && (
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 10,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0,
                }}
              >
                ℹ
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Latest Service Update
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {new Date(updates[updates.length - 1].createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, lineHeight: 1.45 }}>
                  "{updates[updates.length - 1].notes}"
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 6 }}>
                  Expected Completion: <strong style={{ color: '#2563eb' }}>{getEstimatedCompletion(ticket)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Diagnostic Log & Progress Updates */}
          <Card
            title={`Repair Progress & Bench Log (${updates.length})`}
            subtitle="Verified diagnostic records, bench actions, and service milestones"
          >
            {updates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#64748b', fontSize: '0.875rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📋</div>
                No bench updates recorded yet. Diagnostic logs will appear here as technicians service the unit.
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 8 }}>
                {/* Vertical timeline line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 21,
                    top: 14,
                    bottom: 14,
                    width: 2,
                    background: '#e2e8f0',
                    zIndex: 0,
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {updates.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        gap: 14,
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '2px solid #3b82f6',
                          boxShadow: '0 0 0 3px #ffffff',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>

                      <div
                        style={{
                          flexGrow: 1,
                          padding: '12px 16px',
                          background: '#f8fafc',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                            {u.technicianName || 'Operations Service Dispatch'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                          {u.notes}
                        </div>

                        {u.newStatus && (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Status updated to:</span>
                            <StatusBadge status={u.newStatus} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

