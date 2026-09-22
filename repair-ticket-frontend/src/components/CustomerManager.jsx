import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, StatCard, Card, Table, Modal, Input, ConfirmDialog, EmptyState } from './common';
import { PageHeader } from './layout/PageHeader';

export function CustomerManager({ onViewRepairs }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers();
      setCustomers(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch customer directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setAddLoading(true);
    setFormErrors({});
    try {
      await api.createCustomer(formData);
      setShowAddModal(false);
      setFormData({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });
      toast.success('Customer account registered successfully!');
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Customer registration failed.');
    } finally {
      setAddLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await api.deleteCustomer(deleteTargetId);
      toast.success('Customer profile removed successfully.');
      setDeleteTargetId(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer profile.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phoneNumber} ${c.address}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Customer ID',
      key: 'id',
      width: '100px',
      render: (c) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
          #{c.id}
        </span>
      ),
    },
    {
      header: 'Full Name',
      key: 'name',
      render: (c) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
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
            {c.firstName.charAt(0)}{c.lastName.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.firstName} {c.lastName}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Joined: {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Active Client'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Email Address',
      key: 'email',
      render: (c) => (
        <span style={{ color: '#2563eb', fontSize: '0.84rem' }}>{c.email}</span>
      ),
    },
    {
      header: 'Phone Number',
      key: 'phoneNumber',
      render: (c) => (
        <span style={{ color: '#334155', fontSize: '0.84rem' }}>
          {c.phoneNumber || 'Not provided'}
        </span>
      ),
    },
    {
      header: 'Service Address',
      key: 'address',
      render: (c) => (
        <span style={{ color: '#475569', fontSize: '0.8125rem', maxWidth: 220, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.address || 'Standard Location'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (c) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {onViewRepairs && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRepairs(c)}
            >
              View Repairs
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#dc2626', borderColor: '#fecaca' }}
              onClick={() => setDeleteTargetId(c.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customer Directory (CRM)"
        subtitle="Manage client accounts, contact credentials, and hardware repair ownership."
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
            Add New Client
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard
          title="Total Registered Clients"
          value={customers.length}
          subtitle="Active CRM records"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
        />
      </div>

      {/* Search Toolbar */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <input
            type="text"
            placeholder="Search by client name, email, or phone..."
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
      {filteredCustomers.length === 0 && !loading ? (
        <EmptyState
          title="No customer accounts found"
          description={search ? `No accounts match "${search}".` : 'No customers registered yet.'}
          actionLabel="+ Add New Client"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(c) => c.id}
          loading={loading}
        />
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Client Profile"
        subtitle="Add contact information to dispatch tickets and link hardware."
        maxWidth={500}
      >
        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="First Name"
              required
              placeholder="e.g. Bharath"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Kumar"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="e.g. client@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
          />

          <Input
            label="Phone Number"
            placeholder="e.g. +1-555-0199"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          <Input
            label="Service / Mailing Address"
            placeholder="e.g. 844 San Fernando St, Suite 200"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={addLoading}>
              Save Client Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="Delete Customer Profile?"
        message="Are you sure you want to remove this client? Linked hardware devices and past service tickets will be affected."
        confirmText="Delete Account"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
