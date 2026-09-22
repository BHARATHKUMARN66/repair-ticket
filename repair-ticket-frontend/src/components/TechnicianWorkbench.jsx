import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, StatCard, Card, Table, StatusBadge, PriorityBadge, EmptyState } from './common';
import { PageHeader } from './layout/PageHeader';

export function TechnicianWorkbench({ onSelectTicket, onTicketUpdated, initialQueueTab = 'my-bench' }) {
  const { user } = useAuth();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [currentTechnician, setCurrentTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQueueTab, setActiveQueueTab] = useState(initialQueueTab); // 'my-bench' | 'available' | 'all'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (initialQueueTab) {
      setActiveQueueTab(initialQueueTab);
    }
  }, [initialQueueTab]);

  // Resolve or create current technician profile
  const resolveCurrentTechnician = async (techsList) => {
    let currentTechs = techsList || technicians;
    if (!currentTechs || currentTechs.length === 0) {
      currentTechs = await api.getTechnicians().catch(() => []);
      setTechnicians(currentTechs);
    }

    const currentFullName = (user?.fullName || '').toLowerCase().trim();
    const currentUsername = (user?.username || '').toLowerCase().trim();
    const expectedEmail = `${user?.username || 'tech'}@omniclient.io`.toLowerCase().trim();
    const altEmail = `${user?.username || 'tech'}@omnifix.com`.toLowerCase().trim();

    // 1. Match by email or username in email
    let matched = currentTechs.find((t) => {
      const tEmail = (t.email || '').toLowerCase().trim();
      return tEmail === expectedEmail || tEmail === altEmail || (currentUsername && tEmail.includes(currentUsername));
    });

    // 2. Match by full name
    if (!matched && currentFullName) {
      matched = currentTechs.find((t) => {
        const tName = `${t.firstName} ${t.lastName}`.toLowerCase().trim();
        return tName === currentFullName || tName.includes(currentFullName) || currentFullName.includes(tName);
      });
    }

    // 3. Match by username
    if (!matched && currentUsername) {
      matched = currentTechs.find((t) => {
        const f = (t.firstName || '').toLowerCase();
        const l = (t.lastName || '').toLowerCase();
        return f.includes(currentUsername) || l.includes(currentUsername) || currentUsername.includes(f);
      });
    }

    // 4. Auto-provision technician record for this authenticated user if absent
    if (!matched) {
      try {
        const nameParts = (user?.fullName || user?.username || 'Technician Specialist').split(' ');
        const newTech = await api.createTechnician({
          firstName: nameParts[0] || 'Technician',
          lastName: nameParts.slice(1).join(' ') || 'Specialist',
          email: `${user?.username || 'tech'}@omnifix.com`,
          phoneNumber: '+1-555-0188',
          specialization: 'Hardware Diagnostics & Repair',
        });
        matched = newTech;
        setTechnicians((prev) => [...prev, newTech]);
      } catch (err) {
        console.warn('Could not auto-provision technician profile:', err);
        if (currentTechs.length > 0) {
          matched = currentTechs.find((t) => t.active) || currentTechs[0];
        }
      }
    }

    return matched;
  };

  const fetchWorkbenchData = async () => {
    setLoading(true);
    try {
      const [ticketsResp, techsResp] = await Promise.all([
        api.getTickets({ size: 100 }),
        api.getTechnicians().catch(() => []),
      ]);
      const fetchedTickets = ticketsResp.content || [];
      const fetchedTechs = techsResp || [];
      setTickets(fetchedTickets);
      setTechnicians(fetchedTechs);

      const tech = await resolveCurrentTechnician(fetchedTechs);
      setCurrentTechnician(tech);
    } catch (err) {
      toast.error(err.message || 'Failed to load technician workbench.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkbenchData();
  }, [user]);

  // Claim unassigned ticket for oneself
  const handleClaimTicket = async (ticket) => {
    setActionLoadingId(ticket.id);
    try {
      let tech = currentTechnician;
      if (!tech || !tech.id) {
        tech = await resolveCurrentTechnician(technicians);
        setCurrentTechnician(tech);
      }
      if (!tech || !tech.id) {
        throw new Error('Unable to resolve technician profile identifier.');
      }

      await api.assignTechnician(
        ticket.id,
        tech.id,
        `Self-claimed by bench specialist ${user?.fullName || user?.username}`
      );

      toast.success(`Ticket ${ticket.ticketNumber} claimed for your bench!`);
      await fetchWorkbenchData();
      setActiveQueueTab('my-bench'); // Switch to Active on Bench immediately
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error('Failed to claim ticket: ' + (err.message || 'Unknown error'));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Advance ticket status in FSM
  const handleAdvanceStatus = async (ticket, nextStatus) => {
    setActionLoadingId(ticket.id);
    const note = `Bench progress updated to ${nextStatus} by specialist ${user?.fullName || user?.username}`;
    try {
      await api.updateTicketStatus(ticket.id, nextStatus, note);
      toast.success(`Ticket ${ticket.ticketNumber} updated to ${nextStatus.replace('_', ' ')}`);
      await fetchWorkbenchData();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err) {
      toast.error('Failed to update progress: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getDeviceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('laptop') || t.includes('macbook') || t.includes('notebook')) return '💻';
    if (t.includes('phone') || t.includes('iphone') || t.includes('android')) return '📱';
    if (t.includes('tablet') || t.includes('ipad')) return '📟';
    if (t.includes('desktop') || t.includes('pc')) return '🖥️';
    return '🔧';
  };

  // Filter queues: Robustly match tickets assigned to the logged in technician
  const myBenchTickets = tickets.filter((t) => {
    // 1. Match by technician ID
    if (currentTechnician?.id) {
      if (t.assignedTechnicianId === currentTechnician.id || t.technicianId === currentTechnician.id) {
        return true;
      }
    }

    // 2. Match by assigned technician Name
    const assignedName = (t.assignedTechnicianName || t.technicianName || '').toLowerCase().trim();
    if (!assignedName || assignedName === 'unassigned') return false;

    const userFullName = (user?.fullName || '').toLowerCase().trim();
    const userUsername = (user?.username || '').toLowerCase().trim();
    const techName = currentTechnician ? `${currentTechnician.firstName} ${currentTechnician.lastName}`.toLowerCase().trim() : '';

    if (userFullName && (assignedName === userFullName || assignedName.includes(userFullName) || userFullName.includes(assignedName))) {
      return true;
    }
    if (userUsername && (assignedName === userUsername || assignedName.includes(userUsername))) {
      return true;
    }
    if (techName && (assignedName === techName || assignedName.includes(techName) || techName.includes(assignedName))) {
      return true;
    }

    return false;
  });

  const unassignedTickets = tickets.filter((t) => {
    const isUnassigned = !t.assignedTechnicianId && !t.technicianId && (!t.assignedTechnicianName || t.assignedTechnicianName === 'Unassigned') && (!t.technicianName || t.technicianName === 'Unassigned');
    return t.status === 'OPEN' && isUnassigned;
  });

  let displayedTickets = myBenchTickets;
  if (activeQueueTab === 'available') {
    displayedTickets = unassignedTickets;
  } else if (activeQueueTab === 'all') {
    displayedTickets = tickets;
  }

  const assignedCount = myBenchTickets.filter((t) => t.status === 'ASSIGNED').length;
  const inProgressCount = myBenchTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = myBenchTickets.filter((t) => ['REPAIR_COMPLETED', 'CLOSED'].includes(t.status)).length;
  const availableCount = unassignedTickets.length;

  // Render progress decision controls strictly on "Active on Bench"
  const renderBenchProgressDecisions = (t, isLoading) => {
    const nextTransitions = {
      ASSIGNED: [
        { status: 'IN_PROGRESS', label: 'Start Bench Repair', bg: '#2563eb', icon: '▶' },
        { status: 'OPEN', label: 'Return to Intake Pool', bg: '#64748b', icon: '↩' },
      ],
      IN_PROGRESS: [
        { status: 'REPAIR_COMPLETED', label: 'Mark QA Complete', bg: '#059669', icon: '✓' },
        { status: 'ASSIGNED', label: 'Pause / Revert to Assigned', bg: '#d97706', icon: '⏸' },
      ],
      REPAIR_COMPLETED: [
        { status: 'CLOSED', label: 'Ready for Pickup / Close', bg: '#0f172a', icon: '🏁' },
        { status: 'IN_PROGRESS', label: 'Re-open Bench Work', bg: '#2563eb', icon: '🔧' },
      ],
    };

    const options = nextTransitions[t.status] || [];

    if (t.status === 'CLOSED') {
      return (
        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }} />
          ✓ Repaired & Completed
        </span>
      );
    }

    if (t.status === 'CANCELLED') {
      return (
        <span style={{ fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
          Cancelled by Customer
        </span>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Direct primary progress button */}
        {options[0] && (
          <Button
            variant="primary"
            size="sm"
            loading={isLoading}
            onClick={() => handleAdvanceStatus(t, options[0].status)}
            style={{
              background: options[0].bg,
              borderColor: options[0].bg,
              fontWeight: 600,
              fontSize: '0.78rem',
              padding: '4px 10px',
              height: 32,
            }}
          >
            <span style={{ marginRight: 4 }}>{options[0].icon}</span>
            {options[0].label}
          </Button>
        )}

        {/* Progress level dropdown selector so technician can freely choose next stage */}
        {options.length > 1 && (
          <select
            aria-label="Decide Progress Level"
            value=""
            disabled={isLoading}
            onChange={(e) => {
              if (e.target.value) {
                handleAdvanceStatus(t, e.target.value);
              }
            }}
            style={{
              height: 32,
              padding: '0 8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="" disabled>Decide Progress...</option>
            {options.map((opt) => (
              <option key={opt.status} value={opt.status}>
                {opt.icon} Move to {opt.status.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  // Build columns dynamically depending on the active tab
  const columns = [
    {
      header: 'Ticket Code',
      key: 'ticketNumber',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, color: '#2563eb' }}>
            {t.ticketNumber}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(t.ticketNumber);
              toast.success(`Copied: ${t.ticketNumber}`);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex' }}
            title="Copy ticket code"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      ),
    },
    {
      header: 'Hardware Unit',
      key: 'deviceModel',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {getDeviceIcon(t.deviceType)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>
              {t.deviceBrand} {t.deviceModel}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
              S/N: {t.deviceSerialNumber || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Reported Issue',
      key: 'issueDescription',
      render: (t) => (
        <div style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155', fontSize: '0.84rem' }}>
          {t.issueDescription}
        </div>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (t) => <PriorityBadge priority={t.priority} size="sm" />,
    },
    {
      header: 'Status',
      key: 'status',
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    // Conditionally display Assigned Specialist only when in "All Facility Tickets"
    ...(activeQueueTab === 'all'
      ? [
          {
            header: 'Assigned Specialist',
            key: 'assignedTechnicianName',
            render: (t) => (
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: t.assignedTechnicianName && t.assignedTechnicianName !== 'Unassigned' ? '#0f172a' : '#94a3b8',
                  fontWeight: t.assignedTechnicianName && t.assignedTechnicianName !== 'Unassigned' ? 600 : 400,
                }}
              >
                {t.assignedTechnicianName || t.technicianName || 'Unassigned Pool'}
              </span>
            ),
          },
        ]
      : []),
    // Action / Progress column
    {
      header: activeQueueTab === 'my-bench' ? 'Decide Progress Level' : 'Action',
      key: 'action',
      render: (t) => {
        const isLoading = actionLoadingId === t.id;

        // 1. ACTIVE ON BENCH: Technician decides progress level here
        if (activeQueueTab === 'my-bench') {
          return renderBenchProgressDecisions(t, isLoading);
        }

        // 2. AVAILABLE POOL: Offer Claim button
        if (activeQueueTab === 'available') {
          return (
            <Button
              variant="primary"
              size="sm"
              loading={isLoading}
              onClick={() => handleClaimTicket(t)}
              style={{ fontWeight: 600, fontSize: '0.78rem', padding: '4px 10px', height: 32 }}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7.5" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              }
            >
              Claim Ticket (Assign to Me)
            </Button>
          );
        }

        // 3. ALL FACILITY TICKETS:
        // As requested: Remove progress change option from All Facility Tickets
        return (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Facility Queue Record
          </span>
        );
      },
    },
    {
      header: '',
      key: 'view',
      align: 'right',
      render: (t) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectTicket(t)}
          style={{ fontSize: '0.78rem', height: 32 }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Technician Workbench: ${user?.fullName || user?.username}`}
        subtitle="Claim incoming repair tickets, perform bench diagnostics, and advance hardware lifecycle milestones."
        actions={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant={activeQueueTab === 'my-bench' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveQueueTab('my-bench')}
            >
              Active on Bench ({myBenchTickets.length})
            </Button>
            <Button
              variant={activeQueueTab === 'available' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveQueueTab('available')}
              style={activeQueueTab === 'available' ? { background: '#2563eb' } : {}}
            >
              {availableCount > 0 && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#f59e0b',
                    marginRight: 4,
                    display: 'inline-block',
                    animation: 'pulseWarningBadge 2s infinite',
                  }}
                />
              )}
              Available Pool ({availableCount})
            </Button>
            <Button
              variant={activeQueueTab === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveQueueTab('all')}
            >
              All Facility Tickets ({tickets.length})
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard
          title="Active On Bench"
          value={myBenchTickets.length}
          subtitle="Assigned to your bench"
          badge={myBenchTickets.length > 0 ? `${myBenchTickets.length} Active` : null}
          badgeType="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
          active={activeQueueTab === 'my-bench'}
          onClick={() => setActiveQueueTab('my-bench')}
        />

        <StatCard
          title="Available Pool"
          value={availableCount}
          subtitle="Awaiting technician claim"
          badge={availableCount > 0 ? `${availableCount} Open` : null}
          badgeType="warning"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7.5" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          }
          iconColor="#d97706"
          iconBg="#fffbeb"
          active={activeQueueTab === 'available'}
          onClick={() => setActiveQueueTab('available')}
        />

        <StatCard
          title="In Bench Repair"
          value={inProgressCount}
          subtitle="Hardware diagnostics ongoing"
          badge={inProgressCount > 0 ? 'Bench Busy' : null}
          badgeType="warning"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          }
          iconColor="#b45309"
          iconBg="#fffbeb"
        />

        <StatCard
          title="Completed / QA"
          value={completedCount}
          subtitle="QA verified & pickup ready"
          badge={completedCount > 0 ? 'QA Ready' : null}
          badgeType="success"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          }
          iconColor="#047857"
          iconBg="#ecfdf5"
        />
      </div>

      {/* Table Display */}
      {displayedTickets.length === 0 && !loading ? (
        <EmptyState
          title={
            activeQueueTab === 'my-bench'
              ? 'No tickets active on your bench'
              : activeQueueTab === 'available'
              ? 'No unassigned tickets in the pool'
              : 'No tickets found in facility'
          }
          description={
            activeQueueTab === 'my-bench'
              ? 'You currently have zero active tickets assigned. Switch to "Available Pool" to claim an incoming repair order.'
              : activeQueueTab === 'available'
              ? 'Great work! All received hardware tickets have been assigned to bench specialists.'
              : 'There are no repair tickets registered in the facility database.'
          }
          actionLabel={activeQueueTab === 'my-bench' ? 'Claim From Available Pool' : null}
          onAction={() => setActiveQueueTab('available')}
        />
      ) : (
        <Table
          columns={columns}
          data={displayedTickets}
          keyExtractor={(t) => t.id}
          loading={loading}
        />
      )}
    </div>
  );
}

