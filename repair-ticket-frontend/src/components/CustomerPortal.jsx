import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookRepairWizard } from './BookRepairWizard';
import { MyDevices } from './MyDevices';
import { PublicTracker } from './PublicTracker';
import { CancelTicketModal } from './CancelTicketModal';
import { Button, StatCard, Card, Table, StatusBadge, PriorityBadge, EmptyState } from './common';

export function CustomerPortal({ onSelectTicket }) {
  const { user } = useAuth();
  const toast = useToast();

  // Primary subtab navigation: 'repairs' | 'book' | 'devices' | 'tracker'
  const [activeSubTab, setActiveSubTab] = useState('repairs');

  const [customer, setCustomer] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PICKUP' | 'COMPLETED' | 'CANCELLED'
  const [deviceFilterId, setDeviceFilterId] = useState(null);

  // Cross-flow navigation states
  const [preselectedDeviceId, setPreselectedDeviceId] = useState(null);
  const [trackingTicketNumber, setTrackingTicketNumber] = useState('');
  const [cancelModalTicket, setCancelModalTicket] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Load customer profile, registered devices, and repair tickets
  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const userEmail = `${user?.username}@omniclient.io`;
      let cust = null;
      try {
        cust = await api.getCustomerByEmail(userEmail);
      } catch (e) {
        // Not found by exact email yet
      }

      if (!cust) {
        try {
          cust = await api.createCustomer({
            firstName: user?.fullName?.split(' ')[0] || user?.username || 'Customer',
            lastName: user?.fullName?.split(' ').slice(1).join(' ') || 'Client',
            email: userEmail,
            phoneNumber: '+1-555-0100',
            address: 'OmniFix Registered Client',
          });
        } catch (createErr) {
          cust = await api.getCustomerById(1).catch(() => null);
        }
      }

      setCustomer(cust);

      if (cust?.id) {
        const [custTickets, custDevices] = await Promise.all([
          api.getTicketsByCustomer(cust.id).catch(() => []),
          api.getDevicesByCustomer(cust.id).catch(() => []),
        ]);
        setTickets(custTickets || []);
        setDevices(custDevices || []);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [user]);

  // Operational metrics
  const activeRepairsCount = tickets.filter((t) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;
  const pickupCount = tickets.filter((t) => t.status === 'REPAIR_COMPLETED').length;
  const completedCount = tickets.filter((t) => t.status === 'CLOSED').length;
  const devicesCount = devices.length;

  // Filtered tickets list
  const filteredTickets = tickets.filter((t) => {
    if (deviceFilterId && t.deviceId !== deviceFilterId) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status);
    if (statusFilter === 'PICKUP') return t.status === 'REPAIR_COMPLETED';
    if (statusFilter === 'COMPLETED') return t.status === 'CLOSED';
    if (statusFilter === 'CANCELLED') return t.status === 'CANCELLED';
    return true;
  });

  const handleCopyTicketCode = (e, id, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Ticket code copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Turnaround & expected completion calculation
  const getEstimatedDate = (ticket) => {
    if (!ticket?.createdAt) return 'Pending triage';
    const date = new Date(ticket.createdAt);
    let daysToAdd = 3;
    if (ticket.priority === 'URGENT') daysToAdd = 1;
    else if (ticket.priority === 'HIGH') daysToAdd = 2;
    else if (ticket.priority === 'MEDIUM') daysToAdd = 3;
    else daysToAdd = 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toUpperCase();
    if (type.includes('LAPTOP')) return '💻';
    if (type.includes('PHONE') || type.includes('SMARTPHONE')) return '📱';
    if (type.includes('TABLET')) return '📟';
    if (type.includes('DESKTOP') || type.includes('PC')) return '🖥️';
    return '🔧';
  };

  // Switch to Track Repair with prefilled ticket
  const handleTrackTicket = (ticketNumber) => {
    setTrackingTicketNumber(ticketNumber);
    setActiveSubTab('tracker');
  };

  // Launch Book Repair with pre-selected device from My Devices
  const handleBookWithDevice = (deviceId) => {
    setPreselectedDeviceId(deviceId);
    setActiveSubTab('book');
  };

  // Filter repairs by specific device from My Devices
  const handleFilterByDevice = (deviceId) => {
    setDeviceFilterId(deviceId);
    setStatusFilter('ALL');
    setActiveSubTab('repairs');
  };

  // Table columns for dense view
  const repairColumns = [
    {
      header: 'Ticket Code',
      key: 'ticketNumber',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
            {t.ticketNumber}
          </span>
          <button
            type="button"
            onClick={(e) => handleCopyTicketCode(e, t.id, t.ticketNumber)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
            title="Copy Ticket Code"
          >
            {copiedId === t.id ? (
              <span style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 700 }}>Copied!</span>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      ),
    },
    {
      header: 'Device',
      key: 'deviceModel',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.25rem' }}>{getDeviceIcon(t.deviceType)}</span>
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
        <div style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155', fontSize: '0.8125rem' }}>
          {t.issueDescription}
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      header: 'Priority',
      key: 'priority',
      render: (t) => <PriorityBadge priority={t.priority} size="sm" />,
    },
    {
      header: 'Expected By',
      key: 'turnaround',
      render: (t) => (
        <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: 500 }}>
          {getEstimatedDate(t)}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTicket(t);
            }}
          >
            View Repair
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleTrackTicket(t.ticketNumber);
            }}
            title="Open Live Tracking"
          >
            Track
          </Button>

          {['OPEN', 'ASSIGNED'].includes(t.status) && (
            <Button
              variant="danger"
              size="sm"
              style={{ padding: '0 8px', fontSize: '0.75rem' }}
              onClick={(e) => {
                e.stopPropagation();
                setCancelModalTicket(t);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* 1. Customer Welcome Header (Clean, Action-Oriented) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Welcome back, {customer?.firstName || user?.fullName || user?.username}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Inspect active repairs, book hardware service with fast turnarounds, and manage registered devices.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            }
            onClick={() => {
              setPreselectedDeviceId(null);
              setActiveSubTab('book');
            }}
            style={{ fontWeight: 700 }}
          >
            Request New Repair
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveSubTab('devices')}
          >
            Manage Devices
          </Button>
        </div>
      </div>

      {/* 2. Compact Clickable Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Card 1: Active Repairs */}
        <StatCard
          title="Active Repairs"
          value={activeRepairsCount}
          subtitle={activeRepairsCount === 0 ? 'No repairs in progress' : 'In diagnosis & repair'}
          badge={activeRepairsCount > 0 ? `${activeRepairsCount} Active` : null}
          badgeType="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
          active={activeSubTab === 'repairs' && statusFilter === 'ACTIVE' && !deviceFilterId}
          onClick={() => {
            setActiveSubTab('repairs');
            setStatusFilter('ACTIVE');
            setDeviceFilterId(null);
          }}
        />

        {/* Card 2: Ready for Pickup */}
        <StatCard
          title="Ready for Pickup"
          value={pickupCount}
          subtitle={pickupCount === 0 ? 'No units awaiting pickup' : 'QA completed & ready'}
          badge={pickupCount > 0 ? 'Ready!' : null}
          badgeType="success"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          }
          iconColor="#059669"
          iconBg="#ecfdf5"
          active={activeSubTab === 'repairs' && statusFilter === 'PICKUP' && !deviceFilterId}
          onClick={() => {
            setActiveSubTab('repairs');
            setStatusFilter('PICKUP');
            setDeviceFilterId(null);
          }}
        />

        {/* Card 3: Completed Repairs */}
        <StatCard
          title="Completed Repairs"
          value={completedCount}
          subtitle={completedCount === 0 ? 'No past fulfilled orders' : 'Fulfilled service orders'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          }
          iconColor="#64748b"
          iconBg="#f8fafc"
          active={activeSubTab === 'repairs' && statusFilter === 'COMPLETED' && !deviceFilterId}
          onClick={() => {
            setActiveSubTab('repairs');
            setStatusFilter('COMPLETED');
            setDeviceFilterId(null);
          }}
        />

        {/* Card 4: Registered Devices */}
        <StatCard
          title="Registered Devices"
          value={devicesCount}
          subtitle={devicesCount === 0 ? '0 devices on account' : 'Hardware on account'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          }
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
          active={activeSubTab === 'devices'}
          onClick={() => setActiveSubTab('devices')}
        />
      </div>

      {/* 3. Sub-Navigation Tabs & View Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 10,
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
          <Button
            variant={activeSubTab === 'repairs' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveSubTab('repairs');
              setStatusFilter('ALL');
              setDeviceFilterId(null);
            }}
          >
            My Repairs ({tickets.length})
          </Button>

          <Button
            variant={activeSubTab === 'book' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setPreselectedDeviceId(null);
              setActiveSubTab('book');
            }}
          >
            + Book a Repair
          </Button>

          <Button
            variant={activeSubTab === 'devices' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveSubTab('devices')}
          >
            My Devices ({devicesCount})
          </Button>

          <Button
            variant={activeSubTab === 'tracker' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveSubTab('tracker');
            }}
          >
            Track Repair
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: MY REPAIRS WORKSPACE */}
      {/* ========================================================================= */}
      {activeSubTab === 'repairs' && (
        <div>
          {/* Filter Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', marginRight: 4 }}>Filter:</span>
            {[
              { id: 'ALL', label: `All Repairs (${tickets.length})` },
              { id: 'ACTIVE', label: `Active (${activeRepairsCount})` },
              { id: 'PICKUP', label: `Ready for Pickup (${pickupCount})` },
              { id: 'COMPLETED', label: `Completed (${completedCount})` },
              { id: 'CANCELLED', label: `Cancelled (${tickets.filter((t) => t.status === 'CANCELLED').length})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${statusFilter === f.id ? '#2563eb' : '#e2e8f0'}`,
                  background: statusFilter === f.id ? '#eff6ff' : '#ffffff',
                  color: statusFilter === f.id ? '#2563eb' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {f.label}
              </button>
            ))}

            {/* Active Device Filter Chip */}
            {deviceFilterId && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                }}
              >
                Filtered by Device
                <button
                  type="button"
                  onClick={() => setDeviceFilterId(null)}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: 0 }}
                  title="Remove Device Filter"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {/* Empty State vs Content */}
          {filteredTickets.length === 0 ? (
            <EmptyState
              title={tickets.length === 0 ? 'No Repairs Yet' : 'No repairs match your filter'}
              description={
                tickets.length === 0
                  ? "You don't have any repair requests yet. Submit your first hardware service order to get started."
                  : 'Try clearing the active status or device filter to view all repair orders.'
              }
              actionLabel={tickets.length === 0 ? 'Request Your First Repair' : 'Clear Filters'}
              onAction={() => {
                if (tickets.length === 0) {
                  setActiveSubTab('book');
                } else {
                  setStatusFilter('ALL');
                  setDeviceFilterId(null);
                }
              }}
            />
          ) : (
            /* TABLE VIEW */
            <Table
              columns={repairColumns}
              data={filteredTickets}
              keyExtractor={(t) => t.id}
              onRowClick={(t) => onSelectTicket(t)}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: BOOK A REPAIR WIZARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'book' && (
        <BookRepairWizard
          customer={customer}
          preselectedDeviceId={preselectedDeviceId}
          onTicketCreated={(newT) => {
            loadCustomerData();
            toast.success('Repair request submitted successfully!');
            if (newT?.ticketNumber) {
              handleTrackTicket(newT.ticketNumber);
            } else {
              setActiveSubTab('repairs');
            }
          }}
          onCancel={() => setActiveSubTab('repairs')}
          onTrackTicket={(num) => handleTrackTicket(num)}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: MY DEVICES */}
      {/* ========================================================================= */}
      {activeSubTab === 'devices' && (
        <MyDevices
          customer={customer}
          tickets={tickets}
          onDeviceUpdated={() => loadCustomerData()}
          onBookRepair={handleBookWithDevice}
          onViewRepairs={handleFilterByDevice}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: TRACK REPAIR */}
      {/* ========================================================================= */}
      {activeSubTab === 'tracker' && (
        <PublicTracker
          initialTicketNumber={trackingTicketNumber}
          onSelectTicket={onSelectTicket}
        />
      )}

      {/* Cancellation Modal */}
      <CancelTicketModal
        ticket={cancelModalTicket}
        isOpen={Boolean(cancelModalTicket)}
        onClose={() => setCancelModalTicket(null)}
        onTicketCancelled={async () => {
          setCancelModalTicket(null);
          toast.success('Repair request cancelled successfully.');
          await loadCustomerData();
        }}
      />
    </div>
  );
}
