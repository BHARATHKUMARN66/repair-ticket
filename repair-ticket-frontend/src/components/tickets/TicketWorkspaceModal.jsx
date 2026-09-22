import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CancelTicketModal } from '../CancelTicketModal';
import { Button, StatusBadge, PriorityBadge, ConfirmDialog } from '../common';

const LIFECYCLE_STEPS = [
  { id: 'OPEN', label: 'Intake', desc: 'Received at desk' },
  { id: 'ASSIGNED', label: 'Assigned', desc: 'Specialist allocated' },
  { id: 'IN_PROGRESS', label: 'Repair & Diagnosis', desc: 'Bench hardware work' },
  { id: 'REPAIR_COMPLETED', label: 'Quality Check (QA)', desc: 'Passed bench testing' },
  { id: 'CLOSED', label: 'Ready / Collected', desc: 'Dispatched to client' },
];

const ALLOWED_TRANSITIONS = {
  OPEN: ['ASSIGNED', 'CANCELLED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'OPEN', 'CANCELLED', 'CLOSED'],
  IN_PROGRESS: ['REPAIR_COMPLETED', 'ASSIGNED', 'CANCELLED', 'CLOSED'],
  REPAIR_COMPLETED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: ['OPEN'],
  CANCELLED: [],
};

export function TicketWorkspaceModal({ ticketId, isOpen, onClose, onTicketUpdated }) {
  const { isAdmin, isTechnician } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'diagnosis' | 'repair' | 'parts' | 'activity'
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Status transition form
  const [targetStatus, setTargetStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Dispatch technician form
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  // New bench note
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  // Confirm dialogs
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
      setActiveTab('overview');
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

  const allowedStatuses = ticket ? ALLOWED_TRANSITIONS[ticket.status] || [] : [];

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!targetStatus || !ticket) return;
    setStatusLoading(true);
    try {
      await api.updateTicketStatus(ticket.id, targetStatus, statusNotes);
      toast.success(`Ticket transitioned to ${targetStatus}`);
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

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTechId || !ticket) return;
    setAssignLoading(true);
    try {
      await api.assignTechnician(ticket.id, Number(selectedTechId), assignNotes || 'Specialist dispatched from workspace');
      toast.success('Technician assigned successfully');
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

  const executeUnassign = async () => {
    setAssignLoading(true);
    try {
      await api.unassignTechnician(ticket.id, 'Unassigned from workspace desk');
      toast.success('Technician unassigned; ticket reverted to OPEN');
      setConfirmUnassignOpen(false);
      await fetchTicketDetails();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error(err.message || 'Unassign failed.');
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
      toast.success('Diagnostic note appended to history');
      setNewNote('');
      await fetchTicketDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to add note.');
    } finally {
      setNoteLoading(false);
    }
  };

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

  return (
    <div
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-dialog-workspace"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 980,
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
          animation: 'modalZoomIn 0.18s ease',
        }}
      >
        {/* Workspace Top Header */}
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
            <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {ticket?.ticketNumber || 'Ticket Workspace'}
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
                  title="Copy code"
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

        {/* Repair Progress Stepper Banner */}
        {ticket && (
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 30, right: 30, height: 2, background: '#e2e8f0', zIndex: 0 }} />

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
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: isCurrent ? '#2563eb' : isPassed ? '#10b981' : '#ffffff',
                        color: isPassed ? '#ffffff' : '#94a3b8',
                        border: `2px solid ${isCurrent ? '#2563eb' : isPassed ? '#10b981' : '#cbd5e1'}`,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.15)' : 'none',
                      }}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#0f172a' : '#64748b' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workspace Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '0 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#ffffff',
          }}
        >
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'diagnosis', label: 'Diagnosis & Notes' },
            { id: 'repair', label: 'Workflow & Actions' },
            { id: 'parts', label: 'Hardware & Parts' },
            { id: 'activity', label: `Activity Timeline (${updates.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2.5px solid #2563eb' : '2.5px solid transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content */}
        <div style={{ padding: 24, overflowY: 'auto', flexGrow: 1 }}>
          {loading || !ticket ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
              Loading ticket workspace...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Reported Issue Box */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                        Reported Problem Description
                      </div>
                      <div style={{ fontSize: '0.92rem', color: '#0f172a', lineHeight: 1.5, fontWeight: 500 }}>
                        {ticket.issueDescription}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                        Customer Profile
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{ticket.customerName}</div>
                      <div style={{ fontSize: '0.84rem', color: '#2563eb', marginTop: 3 }}>{ticket.customerEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>Customer ID: #{ticket.customerId}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Hardware Device */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                        Hardware Device
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </div>
                      <div style={{ fontSize: '0.84rem', fontFamily: 'monospace', color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                        S/N: {ticket.deviceSerialNumber || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>Device ID: #{ticket.deviceId}</div>
                    </div>

                    {/* SLA & Logistics Card */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                        SLA & Turnaround Logistics
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Logged Date</div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Priority SLA</div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#2563eb', marginTop: 2 }}>
                            {ticket.priority === 'URGENT' ? '24 Hours' : ticket.priority === 'HIGH' ? '1–2 Days' : '3–5 Days'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DIAGNOSIS & BENCH NOTES */}
              {activeTab === 'diagnosis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        Log Diagnostic Inspection / Bench Observation
                      </div>
                      <form onSubmit={handleAddNote}>
                        <textarea
                          placeholder="Log inspection observations, voltage metrics, micro-soldering observations, or customer updates..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '0.84rem',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            marginBottom: 10,
                            fontFamily: 'inherit',
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="primary" size="sm" type="submit" loading={noteLoading} disabled={!newNote.trim()}>
                            Append Diagnostic Note
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Notes Feed */}
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                      Inspection Log History
                    </div>
                    {updates.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem', border: '1px dashed #e2e8f0', borderRadius: 6 }}>
                        No diagnostic notes recorded yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {updates.map((u) => (
                          <div key={u.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                                {u.technicianName && u.technicianName !== 'System / Unspecified' ? u.technicianName : 'Operations Service Desk'}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.4 }}>{u.notes}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: WORKFLOW & ACTIONS */}
              {activeTab === 'repair' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  {/* Status Workflow Transition */}
                  {(isAdmin || isTechnician) && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                        State Machine Status Transition
                      </div>
                      <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                            Select Next Status Action
                          </label>
                          <select
                            value={targetStatus}
                            onChange={(e) => setTargetStatus(e.target.value)}
                            required
                            style={{
                              width: '100%',
                              height: 38,
                              padding: '0 10px',
                              fontSize: '0.84rem',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          >
                            <option value="">Choose valid transition...</option>
                            {allowedStatuses.map((st) => (
                              <option key={st} value={st}>
                                {st.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                            Milestone Reason / Bench Notes
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Diagnostic complete, logic board ready"
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
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
                          />
                        </div>

                        <Button variant="primary" type="submit" loading={statusLoading} disabled={!targetStatus}>
                          Execute Transition
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Specialist Dispatch (Admin Only) */}
                  {isAdmin && ticket.status !== 'CANCELLED' && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          Specialist Allocation
                        </span>
                        {ticket.technicianId && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmUnassignOpen(true)}
                            disabled={assignLoading}
                          >
                            Unassign
                          </Button>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 12 }}>
                        Current Specialist: <strong>{ticket.technicianName || 'Unassigned (Pool)'}</strong>
                      </div>

                      <form onSubmit={handleAssignTechnician} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            height: 38,
                            padding: '0 10px',
                            fontSize: '0.84rem',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            outline: 'none',
                          }}
                        >
                          <option value="">Dispatch active specialist...</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.firstName} {t.lastName} ({t.specialization || 'Hardware'})
                            </option>
                          ))}
                        </select>

                        <Button variant="secondary" type="submit" loading={assignLoading} disabled={!selectedTechId}>
                          Dispatch Specialist
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: HARDWARE & PARTS */}
              {activeTab === 'parts' && (
                <div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      Hardware Components & Serviced Sub-systems
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.4 }}>
                      Verified hardware components, replaced modules, and service materials linked to this repair work order.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#2563eb' }}>Primary Unit</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', marginTop: 3 }}>
                        {ticket.deviceBrand} {ticket.deviceModel}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>
                        S/N: {ticket.deviceSerialNumber || 'N/A'}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Bench Material</div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', marginTop: 3 }}>
                        Logic Board Inspection & Clean Room Reflow
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        Standard bench consumables applied
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIVITY TIMELINE */}
              {activeTab === 'activity' && (
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                    Chronological Bench Audit History ({updates.length})
                  </div>

                  {updates.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem', background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                      No audit updates recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {updates.map((u) => (
                        <div
                          key={u.id}
                          style={{
                            display: 'flex',
                            gap: 12,
                            padding: '12px 16px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3, flexWrap: 'wrap', gap: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                                  {u.technicianName && u.technicianName !== 'System / Unspecified'
                                    ? u.technicianName
                                    : 'Operations Service Desk'}
                                </span>
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: u.technicianName && u.technicianName !== 'System / Unspecified' ? '#eff6ff' : '#f1f5f9',
                                    color: u.technicianName && u.technicianName !== 'System / Unspecified' ? '#2563eb' : '#475569',
                                    border: `1px solid ${u.technicianName && u.technicianName !== 'System / Unspecified' ? '#bfdbfe' : '#e2e8f0'}`,
                                  }}
                                >
                                  {u.technicianName && u.technicianName !== 'System / Unspecified' ? 'Specialist' : 'Intake / Desk'}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.45 }}>{u.notes}</div>

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
              )}
            </>
          )}
        </div>

        {/* Workspace Footer (Admin Actions) */}
        {isAdmin && ticket && (
          <div
            style={{
              padding: '12px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#dc2626', borderColor: '#fecaca' }}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              Delete Ticket Record
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close Workspace
            </Button>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {ticket && (
        <CancelTicketModal
          ticket={ticket}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancelled={() => {
            fetchTicketDetails();
            if (onTicketUpdated) onTicketUpdated();
          }}
        />
      )}

      {/* Unassign Confirmation */}
      <ConfirmDialog
        isOpen={confirmUnassignOpen}
        onClose={() => setConfirmUnassignOpen(false)}
        onConfirm={executeUnassign}
        title="Unassign Specialist?"
        message="This ticket will revert to OPEN (Intake) and return to the facility pool for reassignment."
        confirmText="Unassign Technician"
        variant="warning"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDeleteTicket}
        title="Delete Repair Ticket Record?"
        message={`Permanently remove ticket ${ticket?.ticketNumber}? This will delete all associated bench logs and updates.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}
