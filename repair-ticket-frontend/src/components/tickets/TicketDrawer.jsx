import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, StatusBadge, PriorityBadge, AgeBadge } from '../common';

const LIFECYCLE_STEPS = [
  { id: 'OPEN', label: 'Intake' },
  { id: 'ASSIGNED', label: 'Assigned' },
  { id: 'IN_PROGRESS', label: 'In Repair' },
  { id: 'REPAIR_COMPLETED', label: 'QA Check' },
  { id: 'CLOSED', label: 'Collected' },
];

const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'CANCELLED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'CANCELLED', 'CLOSED'],
  IN_PROGRESS: ['REPAIR_COMPLETED', 'ASSIGNED', 'CANCELLED', 'CLOSED'],
  REPAIR_COMPLETED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN'],
  CANCELLED: [],
};

export function TicketDrawer({
  ticketId,
  isOpen,
  onClose,
  onOpenFullWorkspace,
  onTicketUpdated,
  onNavigateToCustomer,
}) {
  const { isAdmin, isTechnician } = useAuth();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick action states
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  const fetchDetails = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    setTicket(null);
    setUpdates([]);
    try {
      const ticketData = await api.getTicketById(ticketId);
      setTicket(ticketData);

      const updateData = await api.getTicketUpdates(ticketId);
      const scopedUpdates = (updateData || []).filter(
        (u) => !u.ticketId || String(u.ticketId) === String(ticketId)
      );
      setUpdates(scopedUpdates);

      if (isAdmin) {
        const techData = await api.getActiveTechnicians();
        setTechnicians(techData || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchDetails();
    } else {
      setTicket(null);
      setUpdates([]);
      setError(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const allowedStatuses = ticket ? ALLOWED_TRANSITIONS[ticket.status] || [] : [];

  const handleStatusTransition = async (e) => {
    e.preventDefault();
    if (!targetStatus || !ticket) return;
    setStatusLoading(true);
    try {
      await api.updateTicketStatus(ticket.id, targetStatus, statusNotes);
      toast.success(`Status updated to ${targetStatus}`);
      setTargetStatus('');
      setStatusNotes('');
      await fetchDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Transition failed');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssignSpecialist = async (e) => {
    e.preventDefault();
    if (!selectedTechId || !ticket) return;
    setAssignLoading(true);
    try {
      await api.assignTechnician(ticket.id, Number(selectedTechId), 'Dispatched via Quick Drawer');
      toast.success('Technician assigned successfully');
      setSelectedTechId('');
      await fetchDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !ticket) return;
    setNoteLoading(true);
    try {
      await api.addTicketUpdate(ticket.id, newNote.trim());
      toast.success('Diagnostic note appended');
      setNewNote('');
      await fetchDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to log note');
    } finally {
      setNoteLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 940,
        }}
      />

      {/* Slide-over Drawer */}
      <div
        className="ticket-detail-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.12)',
          zIndex: 950,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e2e8f0',
          animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                {ticket?.ticketNumber || 'Ticket Preview'}
              </span>
              {ticket && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ticket.ticketNumber);
                    toast.success('Ticket code copied');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2 }}
                  title="Copy code"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
              Quick Inspection & Lifecycle Drawer
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: 6,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {loading || !ticket ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              Loading ticket details...
            </div>
          ) : (
            <>
              {/* Primary Action Button: Open Full Ticket Workspace */}
              <Button
                variant="primary"
                onClick={() => {
                  if (onOpenFullWorkspace) onOpenFullWorkspace(ticket.id);
                }}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                }}
              >
                <span>Open Full Ticket Workspace</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </Button>

              {/* Status & Priority Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={ticket.status} size="sm" />
                  <PriorityBadge priority={ticket.priority} size="sm" />
                </div>
                <AgeBadge date={ticket.createdAt} priority={ticket.priority} isClosed={ticket.status === 'CLOSED'} />
              </div>

              {/* Repair Lifecycle Stepper */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Repair Lifecycle Progression
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Background track line */}
                  <div style={{ position: 'absolute', top: 10, left: 16, right: 16, height: 2, background: '#e2e8f0', zIndex: 0 }} />

                  {LIFECYCLE_STEPS.map((step, idx) => {
                    const statusOrder = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REPAIR_COMPLETED', 'CLOSED'];
                    const currentIdx = statusOrder.indexOf(ticket.status);
                    const stepIdx = statusOrder.indexOf(step.id);
                    const isPassed = stepIdx <= currentIdx;
                    const isCurrent = stepIdx === currentIdx;

                    return (
                      <div
                        key={step.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: isCurrent ? '#2563eb' : isPassed ? '#10b981' : '#ffffff',
                            color: isPassed ? '#ffffff' : '#94a3b8',
                            border: `2px solid ${isCurrent ? '#2563eb' : isPassed ? '#10b981' : '#cbd5e1'}`,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isPassed && !isCurrent ? '✓' : idx + 1}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#0f172a' : '#64748b' }}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Profile Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    Customer
                  </div>
                  {onNavigateToCustomer && (
                    <button
                      type="button"
                      onClick={() => onNavigateToCustomer(ticket.customerId)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View Profile →
                    </button>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{ticket.customerName}</div>
                <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: 2 }}>{ticket.customerEmail}</div>
              </div>

              {/* Hardware Unit Card */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                  Hardware Unit
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  {ticket.deviceBrand} {ticket.deviceModel}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', marginTop: 3 }}>
                  S/N: {ticket.deviceSerialNumber || 'N/A'}
                </div>
              </div>

              {/* Reported Problem */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                  Reported Issue
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#0f172a', lineHeight: 1.4 }}>
                  {ticket.issueDescription}
                </div>
              </div>

              {/* Specialist Dispatch / Assignment */}
              {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    Assigned Specialist
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#334155', marginBottom: 8 }}>
                    Current: <strong>{ticket.technicianName || ticket.assignedTechnicianName || 'None (Unassigned)'}</strong>
                  </div>

                  {isAdmin && (
                    <form onSubmit={handleAssignSpecialist} style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={selectedTechId}
                        onChange={(e) => setSelectedTechId(e.target.value)}
                        style={{
                          flexGrow: 1,
                          height: 32,
                          padding: '0 8px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="">Reassign specialist...</option>
                        {technicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.firstName} {t.lastName}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="submit"
                        disabled={!selectedTechId || assignLoading}
                        loading={assignLoading}
                        style={{ padding: '0 10px', height: 32 }}
                      >
                        Assign
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Quick Status Transition (FSM) */}
              {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && allowedStatuses.length > 0 && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    Quick Status Transition
                  </div>
                  <form onSubmit={handleStatusTransition} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                        required
                        style={{
                          flexGrow: 1,
                          height: 32,
                          padding: '0 8px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="">Choose next step...</option>
                        {allowedStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant="primary"
                        size="sm"
                        type="submit"
                        disabled={!targetStatus || statusLoading}
                        loading={statusLoading}
                        style={{ padding: '0 12px', height: 32 }}
                      >
                        Advance
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Add Quick Bench Note */}
              {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    Quick Bench Note
                  </div>
                  <form onSubmit={handleAddNote}>
                    <input
                      type="text"
                      placeholder="Add diagnostic observation..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      style={{
                        width: '100%',
                        height: 32,
                        padding: '0 10px',
                        fontSize: '0.78rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        marginBottom: 6,
                        outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        type="submit"
                        disabled={!newNote.trim() || noteLoading}
                        loading={noteLoading}
                        style={{ height: 28, fontSize: '0.72rem' }}
                      >
                        Save Note
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Scoped Recent Activity Feed */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Recent Activity ({updates.length})</span>
                </div>

                {updates.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', border: '1px dashed #e2e8f0', borderRadius: 6 }}>
                    No audit records logged yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {updates.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        style={{
                          padding: '8px 10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6,
                          fontSize: '0.75rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {u.technicianName && u.technicianName !== 'System / Unspecified'
                              ? u.technicianName
                              : 'Operations Service Desk'}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <div style={{ color: '#334155', lineHeight: 1.35 }}>{u.notes}</div>
                        {u.newStatus && u.previousStatus && (
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 3 }}>
                            {u.previousStatus} &rarr; <strong style={{ color: '#2563eb' }}>{u.newStatus}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
