import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, StatCard, Card, Table, Pagination, StatusBadge, PriorityBadge, AgeBadge, EmptyState } from './common';
import { PageHeader } from './layout/PageHeader';
import { AttentionRequired } from './tickets/AttentionRequired';
import { TechnicianWorkload } from './tickets/TechnicianWorkload';
import { TicketKanban } from './tickets/TicketKanban';

export function TicketList({
  onSelectTicket,
  onOpenCreateTicket,
  onNavigateToCustomer,
  onNavigateToDevice,
}) {
  const { isAuthenticated, isAdmin, isTechnician } = useAuth();

  // Primary view state: 'table' vs 'kanban'
  const [viewMode, setViewMode] = useState('table');

  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('createdAt,desc');

  // Attention & Specialist filter states
  const [attentionFilter, setAttentionFilter] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState(null);

  // Copy code feedback
  const [copiedId, setCopiedId] = useState(null);

  // Fetch active technicians for workload capacity section
  useEffect(() => {
    let isMounted = true;
    api.getActiveTechnicians()
      .then((data) => {
        if (isMounted) setTechnicians(data || []);
      })
      .catch(() => {
        api.getTechnicians()
          .then((data) => {
            if (isMounted) setTechnicians(data || []);
          })
          .catch(() => {});
      });
    return () => { isMounted = false; };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // In kanban view, load a larger batch (up to 100) so all workflow columns are populated
      const requestSize = viewMode === 'kanban' ? 100 : size;
      const criteria = {
        page: viewMode === 'kanban' ? 0 : page,
        size: requestSize,
        sort,
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
      };

      const response = await api.getTickets(criteria);
      if (response && response.content) {
        setTickets(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else if (Array.isArray(response)) {
        setTickets(response);
        setTotalElements(response.length);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tickets. Please ensure you are signed in.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, size, status, priority, sort, viewMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTickets();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setAttentionFilter(null);
    setSelectedTechId(null);
    setSort('createdAt,desc');
    setPage(0);
  };

  const handleCopyCode = (e, id, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter handlers for Attention Required
  const handleAttentionFilter = (filterId) => {
    if (attentionFilter === filterId) {
      // Toggle off
      setAttentionFilter(null);
      if (status === 'IN_PROGRESS' || status === 'REPAIR_COMPLETED') {
        setStatus('');
      }
      return;
    }

    setAttentionFilter(filterId);
    setPage(0);

    if (filterId === 'IN_BENCH') {
      setStatus('IN_PROGRESS');
    } else if (filterId === 'READY_PICKUP') {
      setStatus('REPAIR_COMPLETED');
    }
  };

  // Filter handler for Specialist Workload
  const handleSelectTechnician = (techId) => {
    setSelectedTechId((prev) => (prev === techId ? null : techId));
    setPage(0);
  };

  // Apply client-side attention & specialist filters to current dataset
  const displayedTickets = useMemo(() => {
    let list = tickets;

    if (attentionFilter === 'NEEDS_ASSIGNMENT') {
      list = list.filter((t) => t.status === 'OPEN' && !t.technicianId && !t.assignedTechnicianId);
    } else if (attentionFilter === 'OVERDUE_SLA') {
      list = list.filter((t) => {
        if (['CLOSED', 'CANCELLED'].includes(t.status)) return false;
        if (t.priority === 'URGENT') return true;
        if (!t.createdAt) return false;
        const diffHours = (new Date() - new Date(t.createdAt)) / (1000 * 60 * 60);
        return t.priority === 'HIGH' && diffHours > 24;
      });
    }

    if (selectedTechId) {
      list = list.filter(
        (t) => t.technicianId === selectedTechId || t.assignedTechnicianId === selectedTechId
      );
    }

    return list;
  }, [tickets, attentionFilter, selectedTechId]);

  // Operational metrics
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tickets.filter((t) => t.status === 'REPAIR_COMPLETED').length;
  const urgentCount = tickets.filter((t) => t.priority === 'URGENT').length;

  const getDeviceIcon = (deviceType) => {
    const type = (deviceType || '').toUpperCase();
    if (type.includes('LAPTOP')) return '💻';
    if (type.includes('PHONE') || type.includes('SMARTPHONE')) return '📱';
    if (type.includes('TABLET')) return '📟';
    if (type.includes('DESKTOP') || type.includes('PC')) return '🖥️';
    return '🔧';
  };

  // Table Column Definitions with clickable customer & device
  const columns = [
    {
      header: 'Ticket Code',
      key: 'ticketNumber',
      render: (t) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.85rem' }}>
              {t.ticketNumber}
            </span>
            <button
              type="button"
              onClick={(e) => handleCopyCode(e, t.id, t.ticketNumber)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 2,
                display: 'flex',
                alignItems: 'center',
              }}
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
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
            {new Date(t.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customerName',
      render: (t) => {
        const initials = (t.customerName || 'Customer')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return (
          <div
            onClick={(e) => {
              if (onNavigateToCustomer && t.customerId) {
                e.stopPropagation();
                onNavigateToCustomer(t.customerId);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: onNavigateToCustomer ? 'pointer' : 'default',
            }}
            title={onNavigateToCustomer ? 'View Customer Profile' : undefined}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: onNavigateToCustomer ? '#2563eb' : '#0f172a',
                  textDecoration: onNavigateToCustomer ? 'underline' : 'none',
                  textDecorationColor: '#bfdbfe',
                }}
              >
                {t.customerName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.customerEmail}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Hardware Unit',
      key: 'device',
      render: (t) => (
        <div
          onClick={(e) => {
            if (onNavigateToDevice && t.deviceId) {
              e.stopPropagation();
              onNavigateToDevice(t.deviceId);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: onNavigateToDevice ? 'pointer' : 'default',
          }}
          title={onNavigateToDevice ? 'View Hardware Unit' : undefined}
        >
          <span style={{ fontSize: '1.25rem' }}>{getDeviceIcon(t.deviceType)}</span>
          <div>
            <div
              style={{
                fontWeight: 600,
                color: onNavigateToDevice ? '#2563eb' : '#0f172a',
              }}
            >
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
        <div
          style={{
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#334155',
            fontSize: '0.8125rem',
          }}
          title={t.issueDescription}
        >
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
      header: 'Specialist',
      key: 'technicianName',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: t.technicianId ? '#10b981' : '#cbd5e1',
            }}
          />
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: t.technicianId ? 600 : 400,
              color: t.technicianId ? '#0f172a' : '#94a3b8',
            }}
          >
            {t.technicianName || 'Unassigned'}
          </span>
        </div>
      ),
    },
    {
      header: 'Lifecycle Status',
      key: 'status',
      render: (t) => <StatusBadge status={t.status} size="sm" />,
    },
    {
      header: 'Age / SLA',
      key: 'createdAt',
      render: (t) => <AgeBadge createdAt={t.createdAt} priority={t.priority} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (t) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTicket(t);
          }}
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Quick View
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header with Action Buttons & View Mode Switcher */}
      <PageHeader
        title="Repair Tickets Workspace"
        subtitle="Centralized operational console, lifecycle tracking, bench dispatch, and diagnostic logs."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* View Switcher: Table View vs Kanban Board */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                padding: 3,
              }}
              role="group"
              aria-label="Workspace View Mode"
            >
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 120ms ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                Table View
              </button>

              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                  color: viewMode === 'kanban' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 120ms ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                </svg>
                Kanban Board
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
              }
            >
              Refresh
            </Button>

            {isAuthenticated && (
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreateTicket}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                }
              >
                New Repair Ticket
              </Button>
            )}
          </div>
        }
      />

      {/* Actionable Attention Required Alert Cards */}
      <AttentionRequired
        tickets={tickets}
        currentFilter={attentionFilter}
        onSelectFilter={handleAttentionFilter}
      />

      {/* Bench Specialist Capacity & Workload Section */}
      {(isAdmin || isTechnician) && technicians.length > 0 && (
        <TechnicianWorkload
          technicians={technicians}
          tickets={tickets}
          selectedTechId={selectedTechId}
          onSelectTechnician={handleSelectTechnician}
        />
      )}

      {/* Metric KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 18,
        }}
      >
        <StatCard
          title="Total In Queue"
          value={totalElements}
          subtitle="All service records"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
          onClick={() => { setStatus(''); setAttentionFilter(null); setSelectedTechId(null); setPage(0); }}
          active={!status && !attentionFilter && !selectedTechId}
        />

        <StatCard
          title="Pending Intake"
          value={openCount}
          subtitle="Intake & awaiting bench"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          }
          iconColor="#6d28d9"
          iconBg="#f5f3ff"
          onClick={() => { setStatus('OPEN'); setPage(0); }}
          active={status === 'OPEN'}
        />

        <StatCard
          title="Active On Bench"
          value={inProgressCount}
          subtitle="Hardware diagnostics"
          badge={inProgressCount > 0 ? 'Bench Busy' : null}
          badgeType="warning"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          }
          iconColor="#b45309"
          iconBg="#fffbeb"
          onClick={() => { setStatus('IN_PROGRESS'); setPage(0); }}
          active={status === 'IN_PROGRESS'}
        />

        <StatCard
          title="Ready For Pickup"
          value={completedCount}
          subtitle="QA passed & collected"
          badge={completedCount > 0 ? 'Ready' : null}
          badgeType="success"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          }
          iconColor="#047857"
          iconBg="#ecfdf5"
          onClick={() => { setStatus('REPAIR_COMPLETED'); setPage(0); }}
          active={status === 'REPAIR_COMPLETED'}
        />
      </div>

      {/* Filter & Search Toolbar */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, minWidth: 260, display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search ticket code, customer, device, or problem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: 36,
                  paddingLeft: 34,
                  paddingRight: 12,
                  fontSize: '0.84rem',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.2"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            style={{
              height: 36,
              padding: '0 10px',
              fontSize: '0.84rem',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open (Intake)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REPAIR_COMPLETED">QA Completed</option>
            <option value="CLOSED">Closed / Picked Up</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(0);
            }}
            style={{
              height: 36,
              padding: '0 10px',
              fontSize: '0.84rem',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="URGENT">Urgent Escalation</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{
              height: 36,
              padding: '0 10px',
              fontSize: '0.84rem',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              outline: 'none',
            }}
          >
            <option value="createdAt,desc">Newest First</option>
            <option value="createdAt,asc">Oldest First</option>
            <option value="priority,desc">Highest Priority</option>
          </select>

          {/* Active Filter Chips & Clear */}
          {(search || status || priority || attentionFilter || selectedTechId || sort !== 'createdAt,desc') && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filter Summary Banner if filters are active */}
        {(attentionFilter || selectedTechId) && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.78rem',
              color: '#475569',
            }}
          >
            <span style={{ fontWeight: 600 }}>Active Filters:</span>
            {attentionFilter && (
              <span
                style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Attention: {attentionFilter.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setAttentionFilter(null)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}
            {selectedTechId && (
              <span
                style={{
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Specialist: {technicians.find((t) => t.id === selectedTechId)?.name || `#${selectedTechId}`}
                <button
                  type="button"
                  onClick={() => setSelectedTechId(null)}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', padding: 0 }}
                >
                  ✕
                </button>
              </span>
            )}
            <span style={{ color: '#94a3b8' }}>({displayedTickets.length} tickets matching)</span>
          </div>
        )}
      </Card>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 6,
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={fetchTickets}>
            Retry
          </Button>
        </div>
      )}

      {/* MAIN VIEW: KANBAN vs TABLE */}
      {viewMode === 'kanban' ? (
        <TicketKanban
          tickets={displayedTickets}
          onSelectTicket={onSelectTicket}
          onOpenCreateTicket={onOpenCreateTicket}
        />
      ) : (
        <>
          {displayedTickets.length === 0 && !loading ? (
            <EmptyState
              title="No repair tickets found"
              description="No service tickets match your filter criteria. Try clearing filters or logging a new intake ticket."
              actionLabel="Clear Filters"
              onAction={handleClearFilters}
              secondaryActionLabel={isAuthenticated ? '+ Create Ticket' : null}
              onSecondaryAction={onOpenCreateTicket}
            />
          ) : (
            <Table
              columns={columns}
              data={displayedTickets}
              keyExtractor={(t) => t.id}
              loading={loading}
              onRowClick={(t) => onSelectTicket(t)}
            />
          )}

          {/* Pagination for Table view */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={size}
            onPageChange={(newPage) => setPage(newPage)}
            itemLabel="tickets"
          />
        </>
      )}
    </div>
  );
}
