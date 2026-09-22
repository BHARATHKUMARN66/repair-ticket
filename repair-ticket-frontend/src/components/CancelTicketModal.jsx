import React, { useState } from 'react';
import { api } from '../services/api';

const QUICK_REASONS = [
  "Issue resolved on its own",
  "Purchased a replacement device",
  "Repaired through third-party or local shop",
  "Turnaround time or estimate not suitable",
  "Submitted by mistake / duplicate ticket",
];

export function CancelTicketModal({ ticket, isOpen, onClose, onTicketCancelled }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !ticket) return null;

  const handleSelectQuickReason = (text) => {
    if (!reason.trim()) {
      setReason(text);
    } else if (!reason.includes(text)) {
      setReason(prev => `${prev.trim()}. ${text}`);
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 5) {
      setError('Please provide a descriptive reason of at least 5 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.cancelTicket(ticket.id, trimmedReason);
      setReason('');
      if (onTicketCancelled) {
        onTicketCancelled(ticket.id, trimmedReason);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to cancel the ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Cancel Repair Ticket
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Ref: <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{ticket.ticketNumber}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} disabled={submitting}>&times;</button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Ticket Summary Card */}
        <div style={{
          background: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {ticket.device ? `${ticket.device.brand} ${ticket.device.model}` : (ticket.deviceBrand ? `${ticket.deviceBrand} ${ticket.deviceModel}` : 'Hardware Unit')}
            </span>
            <span className={`badge badge-${ticket.status?.toLowerCase()}`} style={{ fontSize: '0.72rem' }}>
              {ticket.status?.replace('_', ' ')}
            </span>
          </div>
          <div style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {ticket.issueDescription}
          </div>
        </div>

        {/* Warning Notice */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
          padding: '0.75rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem',
          lineHeight: 1.45,
          marginBottom: '1.25rem',
          display: 'flex',
          gap: '0.6rem'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <div>
            <strong>Notice:</strong> Cancelling will withdraw this ticket from the active bench queue. This transition is recorded in the permanent audit history.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reason Input */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                Why are you cancelling this ticket? <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: reason.trim().length >= 5 ? 'var(--text-muted)' : 'var(--danger)' }}>
                {reason.trim().length} / 500 (min 5 chars)
              </span>
            </div>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="e.g. Device issue resolved on its own after rebooting, replacement purchased, or service no longer needed..."
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              required
              disabled={submitting}
              style={{ minHeight: 85, fontSize: '0.88rem' }}
            />
          </div>

          {/* Quick Reasons Chips */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Select common reasons to append:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {QUICK_REASONS.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="reason-chip"
                  onClick={() => handleSelectQuickReason(qr)}
                  disabled={submitting}
                >
                  + {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Keep Ticket
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={submitting || reason.trim().length < 5}
              style={{ fontWeight: 700 }}
            >
              {submitting ? 'Cancelling Ticket...' : 'Confirm Ticket Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
