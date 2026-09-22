import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, StatCard, Card, Table, Modal, Input, Select, ConfirmDialog, EmptyState } from './common';
import { PageHeader } from './layout/PageHeader';

export function TechnicianManager() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialization: 'Logic Board & Micro-Soldering',
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const [tickets, setTickets] = useState([]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let pass = 'Tech@2026!';
    for (let i = 0; i < 3; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const [data, ticketData] = await Promise.all([
        api.getTechnicians(),
        api.getTickets({ size: 100 }).catch(() => ({ content: [] })),
      ]);
      setTechnicians(data || []);
      setTickets(ticketData?.content || (Array.isArray(ticketData) ? ticketData : []));
    } catch (err) {
      toast.error(err.message || 'Failed to load technician roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleToggleStatus = async (id) => {
    if (!isAdmin) return;
    try {
      await api.toggleTechnicianStatus(id);
      toast.success('Technician on-duty status updated.');
      fetchTechnicians();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle technician status.');
    }
  };

  const handleCreateTechnician = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    const phoneNumber = (formData.phoneNumber || '').trim();
    if (!phoneNumber) {
      errs.phoneNumber = 'Phone number is required.';
    }

    const username = (formData.username || '').trim() || (formData.email ? formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') : '');
    if (!username) {
      errs.username = 'Portal login username is required.';
    }

    const password = (formData.password || '').trim();
    if (!password) {
      errs.password = 'Initial password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setAddLoading(true);
    setFormErrors({});
    try {
      await api.createTechnician({
        ...formData,
        phoneNumber,
        username,
        password,
      });
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        specialization: 'Logic Board & Micro-Soldering',
        username: '',
        password: '',
      });
      toast.success(`Technician ${formData.firstName} onboarded with portal username @${username}!`);
      fetchTechnicians();
    } catch (err) {
      if (err.data?.validationErrors || err.fieldErrors) {
        setFormErrors(err.data?.validationErrors || err.fieldErrors);
      }
      toast.error(err.message || 'Technician onboarding failed.');
    } finally {
      setAddLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await api.deleteTechnician(deleteTargetId);
      toast.success('Technician removed and assigned tickets unlinked.');
      setDeleteTargetId(null);
      fetchTechnicians();
    } catch (err) {
      toast.error(err.message || 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = technicians.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.specialization} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = technicians.filter((t) => t.active).length;
  const offDutyCount = technicians.length - activeCount;

  const columns = [
    {
      header: 'Staff ID',
      key: 'id',
      width: '90px',
      render: (t) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
          #{t.id}
        </span>
      ),
    },
    {
      header: 'Specialist Name',
      key: 'name',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
              fontWeight: 700,
              flexShrink: 0,
              border: '1px solid #bfdbfe',
            }}
          >
            {t.firstName.charAt(0)}{t.lastName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.firstName} {t.lastName}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span>{t.email}</span>
              {t.username && (
                <span style={{ fontFamily: 'monospace', background: '#eff6ff', color: '#2563eb', padding: '1px 5px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600 }}>
                  @{t.username}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Technical Specialization',
      key: 'specialization',
      render: (t) => (
        <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.84rem' }}>
          {t.specialization || 'General Hardware'}
        </span>
      ),
    },
    {
      header: 'Bench Workload',
      key: 'workload',
      render: (t) => {
        const assignedCount = tickets.filter(
          (tick) => (tick.assignedTechnicianId === t.id || tick.technicianId === t.id) &&
                    ['ASSIGNED', 'IN_PROGRESS'].includes(tick.status)
        ).length;

        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.75rem',
              fontWeight: 600,
              background: assignedCount > 0 ? '#fffbeb' : '#f1f5f9',
              color: assignedCount > 0 ? '#b45309' : '#64748b',
              border: `1px solid ${assignedCount > 0 ? '#fde68a' : '#e2e8f0'}`,
            }}
          >
            {assignedCount > 0 ? `${assignedCount} Active Bench Tasks` : 'Queue Clear'}
          </span>
        );
      },
    },
    {
      header: 'Duty Availability',
      key: 'active',
      render: (t) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(t.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 600,
            border: `1px solid ${t.active ? '#a7f3d0' : '#cbd5e1'}`,
            background: t.active ? '#ecfdf5' : '#f1f5f9',
            color: t.active ? '#047857' : '#475569',
            cursor: isAdmin ? 'pointer' : 'default',
            outline: 'none',
            transition: 'all 120ms ease',
          }}
          title={isAdmin ? 'Click to toggle active on-duty status' : ''}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: t.active ? '#10b981' : '#94a3b8',
            }}
          />
          {t.active ? 'Active On Duty' : 'Standby / Off'}
        </button>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (t) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(t.id)}
              >
                {t.active ? 'Set Standby' : 'Set Active'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                style={{ color: '#dc2626', borderColor: '#fecaca' }}
                onClick={() => setDeleteTargetId(t.id)}
              >
                Remove
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Technician Workforce Management"
        subtitle="Specialist allocations, bench capacity management, and duty availability controls."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            }
          >
            Onboard Technician
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard
          title="Total Workforce"
          value={technicians.length}
          subtitle="Certified specialists"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
        />

        <StatCard
          title="Active On Duty"
          value={activeCount}
          subtitle="Ready for ticket dispatch"
          badge={activeCount > 0 ? 'Benches Staffed' : null}
          badgeType="success"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          }
          iconColor="#059669"
          iconBg="#ecfdf5"
        />

        <StatCard
          title="Standby / Off"
          value={offDutyCount}
          subtitle="Currently unavailable"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
            </svg>
          }
          iconColor="#64748b"
          iconBg="#f1f5f9"
        />
      </div>

      {/* Search Toolbar */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <input
            type="text"
            placeholder="Search by specialist name, specialization, or email..."
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
      </Card>

      {/* Table Display */}
      {filtered.length === 0 && !loading ? (
        <EmptyState
          title="No technicians found"
          description={search ? `No staff match "${search}".` : 'No technicians in roster.'}
          actionLabel="+ Onboard Technician"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(t) => t.id}
          loading={loading}
        />
      )}

      {/* Add Technician Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Onboard Technician"
        subtitle="Add a certified hardware diagnostic and bench repair specialist."
        maxWidth={500}
      >
        <form onSubmit={handleCreateTechnician} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="First Name"
              required
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. john.doe@omnifix.pro"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />

          <Input
            label="Phone Number"
            required
            placeholder="e.g. +1-555-0188 or 9344128641"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={formErrors.phoneNumber}
          />

          <Select
            label="Primary Bench Specialization"
            required
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            options={[
              { value: 'Logic Board & Micro-Soldering', label: 'Logic Board & Micro-Soldering' },
              { value: 'Display & Glass Assembly', label: 'Display & Glass Assembly' },
              { value: 'Power Delivery & Battery', label: 'Power Delivery & Battery' },
              { value: 'Mobile Device Diagnostics', label: 'Mobile Device Diagnostics' },
              { value: 'Data Recovery & Storage', label: 'Data Recovery & Storage' },
              { value: 'General Hardware Diagnostics', label: 'General Hardware Diagnostics' },
            ]}
          />

          {/* Section Divider: Staff Login Credentials */}
          <div
            style={{
              marginTop: 4,
              paddingTop: 12,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                Workbench Login Credentials
              </div>
              <button
                type="button"
                onClick={generatePassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                + Generate Password
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input
                label="Portal Username"
                required
                placeholder="e.g. tech_john"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                error={formErrors.username}
                helperText="For /technician sign in"
              />

              <Input
                label="Initial Password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={formErrors.password}
                helperText="Min 6 characters"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                }
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={addLoading}>
              Onboard Specialist
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="Decommission Technician?"
        message="Are you sure you want to remove this technician from the workforce roster? Active tickets may need to be reassigned."
        confirmText="Decommission"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
