import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CancelTicketModal } from './CancelTicketModal';
import { Button, StatusBadge, PriorityBadge, ConfirmDialog } from './common';

// Permitted Finite State Machine transitions
const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'CANCELLED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'CANCELLED', 'CLOSED'],
  IN_PROGRESS: ['REPAIR_COMPLETED', 'ASSIGNED', 'CANCELLED', 'CLOSED'],
  REPAIR_COMPLETED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN'],
  CANCELLED: [],
};

export function TicketDetailModal({ ticketId, isOpen, onClose, onTicketUpdated }) {
  const { isAuthenticated, isAdmin, isTechnician } = useAuth();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Status Change Form
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Assign Technician Form
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // New Note Form
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Confirm Dialog State
  const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    setTicket(null);
    setUpdates([]);
    try {
      const ticketData = await api.getTicketById(ticketId);
      setTicket(ticketData);

      const updateData = await api.getTicketUpdates(ticketId);
      // Strictly enforce that all updates belong to this ticket ID
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
      setTicket(null);
      setUpdates([]);
      fetchTicketDetails();
    } else if (!isOpen) {
      setTicket(null);
      setUpdates([]);
      setError(null);
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  // Handle Status Update via FSM
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;
    setStatusLoading(true);
    try {
      await api.updateTicketStatus(ticket.id, targetStatus, statusNotes);
      toast.success(`Ticket status transitioned to ${targetStatus}`);
      setStatusNotes('');
      setTargetStatus('');
      await fetchTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Status transition failed.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Handle Assign Technician
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTechId) return;
    setAssignLoading(true);
    try {
      await api.assignTechnician(ticket.id, Number(selectedTechId), assignNotes);
      toast.success('Technician assigned successfully!');
      setAssignNotes('');
      setSelectedTechId('');
      await fetchTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Assignment failed.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle Unassign Technician
  const executeUnassignTechnician = async () => {
    setAssignLoading(true);
    try {
      await api.unassignTechnician(ticket.id, 'Unassigned by Administrator');
      toast.success('Technician unassigned; ticket status reverted to OPEN.');
      setConfirmUnassignOpen(false);
      await fetchTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Unassign failed.');
    } finally {
      setAssignLoading(false);
    }
  };

  // Handle Add Diagnostic Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      await api.addTicketUpdate(ticket.id, newNote.trim());
      toast.success('Diagnostic note appended to history!');
      setNewNote('');
      await fetchTicketDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to add note.');
    } finally {
      setNoteLoading(false);
    }
  };

  // Handle Delete Ticket
  const executeDeleteTicket = async () => {
    try {
      await api.deleteTicket(ticket.id);
      toast.success(`Ticket ${ticket.ticketNumber} deleted.`);
      setConfirmDeleteOpen(false);
      if (onTicketUpdated) onTicketUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete ticket.');
    }
  };

  const allowedStatuses = ticket ? (ALLOWED_TRANSITIONS[ticket.status] || []) : [];

  return (
    <div
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-dialog-desk"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 960,
          background: '#ffffff',
          borderRadius: 10,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
          animation: 'modalZoomIn 0.18s ease',
        }}
      >
        {/* Service Desk Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              {ticket?.ticketNumber || 'Ticket Details'}
            </span>
            {ticket && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ticket.ticketNumber);
                    toast.success('Ticket code copied to clipboard');
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: 2 }}
                  title="Copy ticket code"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                  • {ticket.deviceBrand} {ticket.deviceModel}
                </span>
                <PriorityBadge priority={ticket.priority} size="sm" />
                <StatusBadge status={ticket.status} size="sm" />
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {ticket && ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.status) && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Ticket
              </Button>
            )}

            <button
              onClick={onClose}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Service Desk Content */}
        <div style={{ padding: 24, overflowY: 'auto', flexGrow: 1 }}>
          {loading || !ticket ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              Loading ticket details...
            </div>
          ) : (
            <div>
              {/* Cancelled Banner */}
              {ticket.status === 'CANCELLED' && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    padding: '12px 16px',
                    color: '#991b1b',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <div>
                    <strong>Ticket Cancelled:</strong> This service request has been withdrawn. Bench operations and transitions are closed.
                  </div>
                </div>
              )}

              {/* 2-Column Real-world Service Desk Layout */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 24,
                  alignItems: 'start',
                }}
              >
                {/* LEFT / MAIN COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Issue Summary */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: 6 }}>
                      Customer Reported Problem
                    </div>
                    <div style={{ fontSize: '0.9375rem', color: '#0f172a', lineHeight: 1.5, fontWeight: 500 }}>
                      {ticket.issueDescription}
                    </div>
                  </div>

                  {/* Device & Customer Metadata */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                        Customer Profile
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{ticket.customerName}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#2563eb', marginTop: 2 }}>{ticket.customerEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Customer ID: #{ticket.customerId}</div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                        Hardware Device
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>{ticket.deviceBrand} {ticket.deviceModel}</div>
                      <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
                        S/N: {ticket.deviceSerialNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Device ID: #{ticket.deviceId}</div>
                    </div>
                  </div>

                  {/* Diagnostic & Bench Note Form (Staff / Admin) */}
                  {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Add Diagnostic / Bench Note
                      </div>

                      <form onSubmit={handleAddNote}>
                        <textarea
                          placeholder="Log inspection observations, component repairs, or customer updates..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '0.84rem',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            marginBottom: 8,
                            fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="primary"
                            size="sm"
                            type="submit"
                            loading={noteLoading}
                            disabled={!newNote.trim()}
                          >
                            Save Bench Note
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Vertical History Timeline */}
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      Repair History & Bench Timeline ({updates.length})
                    </div>

                    {updates.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                        No audit updates recorded yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {updates.map((u) => (
                          <div
                            key={u.id}
                            style={{
                              display: 'flex',
                              gap: 12,
                              padding: '10px 14px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.72rem',
                                flexShrink: 0,
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              ●
                            </div>

                            <div style={{ flexGrow: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, flexWrap: 'wrap', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                                    {u.technicianName && u.technicianName !== 'System / Unspecified'
                                      ? u.technicianName
                                      : 'Operations Service Desk'}
                                  </span>
                                  {u.technicianName && u.technicianName !== 'System / Unspecified' ? (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                                      Specialist
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                                      Intake / Desk
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>
                                {u.notes}
                              </div>

                              {u.newStatus && u.previousStatus && (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                                  Status: <span style={{ color: '#475569' }}>{u.previousStatus}</span> &rarr; <strong style={{ color: '#2563eb' }}>{u.newStatus}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDEBAR / WORKFLOW ACTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Status Workflow Transition (FSM) */}
                  {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        Workflow Status Transition
                      </div>

                      <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                            Next State Machine Action
                          </label>
                          <select
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value)}
                            required
                            style={{
                              width: '100%',
                              height: 36,
                              padding: '0 10px',
                              fontSize: '0.84rem',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          >
                            <option value="">Select next transition...</option>
                            {allowedStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                            Transition Reason / Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Diagnostic complete, parts ready"
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            style={{
                              width: '100%',
                              height: 34,
                              padding: '0 10px',
                              fontSize: '0.8125rem',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          type="submit"
                          loading={statusLoading}
                          disabled={!targetStatus}
                        >
                          Execute Transition
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Specialist Dispatch (Admin Only) */}
                  {isAdmin && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                          Specialist Dispatch
                        </span>
                        {ticket.technicianId && (
                          <Button
                            variant="danger"
                            size="sm"
                            style={{ padding: '0 6px', fontSize: '0.6875rem' }}
                            onClick={() => setConfirmUnassignOpen(true)}
                            disabled={assignLoading}
                          >
                            Unassign
                          </Button>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>
                        Current Tech: <strong style={{ color: ticket.technicianId ? '#0f172a' : '#94a3b8' }}>{ticket.technicianName || 'None (Unassigned)'}</strong>
                      </div>

                      <form onSubmit={handleAssignTechnician} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            height: 36,
                            padding: '0 10px',
                            fontSize: '0.84rem',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            outline: 'none',
                          }}
                        >
                          <option value="">Choose active specialist...</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.firstName} {t.lastName} ({t.specialization || 'General'})
                            </option>
                          ))}
                        </select>

                        <Button
                          variant="secondary"
                          size="sm"
                          type="submit"
                          loading={assignLoading}
                          disabled={!selectedTechId}
                        >
                          Dispatch Specialist
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Metadata Sidebar Card */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 10 }}>
                      Operational Metadata
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Created Date:</span>
                        <strong style={{ color: '#0f172a' }}>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Priority SLA:</span>
                        <strong style={{ color: '#2563eb' }}>{ticket.priority}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Turnaround:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {ticket.priority === 'URGENT' ? '24 Hours' : ticket.priority === 'HIGH' ? '1–2 Days' : '3–5 Days'}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Service Hub:</span>
                        <strong style={{ color: '#0f172a' }}>OmniFix Central</strong>
                      </div>
                    </div>
                  </div>

                  {/* Destructive Delete Action (Admin Only) */}
                  {isAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: '#dc2626' }}
                        onClick={() => setConfirmDeleteOpen(true)}
                      >
                        Delete Ticket Record
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <CancelTicketModal
        ticket={ticket}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onTicketCancelled={async () => {
          setShowCancelModal(false);
          toast.success('Ticket cancelled successfully.');
          await fetchTicketDetails();
          if (onTicketUpdated) onTicketUpdated();
        }}
      />

      {/* Confirm Unassign Dialog */}
      <ConfirmDialog
        isOpen={confirmUnassignOpen}
        onClose={() => setConfirmUnassignOpen(false)}
        onConfirm={executeUnassignTechnician}
        title="Unassign Specialist?"
        message="Are you sure you want to unassign the current technician? The ticket will revert to OPEN status."
        confirmText="Unassign"
        variant="warning"
        loading={assignLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDeleteTicket}
        title={`Delete Ticket #${ticket?.ticketNumber}?`}
        message="Permanently remove this ticket record? All associated audit updates will be deleted. This cannot be undone."
        confirmText="Delete Ticket"
        variant="danger"
      />
    </div>
  );
}
