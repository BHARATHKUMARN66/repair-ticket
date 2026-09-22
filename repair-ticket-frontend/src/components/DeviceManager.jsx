import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, StatCard, Card, Table, Modal, Input, Select, ConfirmDialog, EmptyState } from './common';
import { PageHeader } from './layout/PageHeader';

export function DeviceManager({ onViewRepairs }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [devices, setDevices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    deviceType: 'LAPTOP',
    customerId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);

  const fetchDevicesAndCustomers = async () => {
    setLoading(true);
    try {
      const [devList, custList] = await Promise.all([
        api.getDevices(),
        api.getCustomers().catch(() => []),
      ]);
      setDevices(devList || []);
      setCustomers(custList || []);
      if (custList && custList.length > 0) {
        setFormData((prev) => ({ ...prev, customerId: custList[0].id }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load device inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevicesAndCustomers();
  }, []);

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.brand.trim()) errs.brand = 'Brand is required.';
    if (!formData.model.trim()) errs.model = 'Model is required.';
    if (!formData.serialNumber.trim()) errs.serialNumber = 'Serial number is required.';
    if (!formData.customerId) errs.customerId = 'Owning customer is required.';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setAddLoading(true);
    setFormErrors({});
    try {
      await api.createDevice({
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        deviceType: formData.deviceType,
        customerId: Number(formData.customerId),
      });
      setShowAddModal(false);
      setFormData({
        brand: '',
        model: '',
        serialNumber: '',
        deviceType: 'LAPTOP',
        customerId: customers[0]?.id || '',
      });
      toast.success('Hardware device registered successfully!');
      fetchDevicesAndCustomers();
    } catch (err) {
      toast.error(err.message || 'Device registration failed.');
    } finally {
      setAddLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      await api.deleteDevice(deleteTargetId);
      toast.success('Device record deleted.');
      setDeleteTargetId(null);
      fetchDevicesAndCustomers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete device record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredDevices = devices.filter((d) =>
    `${d.brand} ${d.model} ${d.serialNumber} ${d.deviceType}`.toLowerCase().includes(search.toLowerCase())
  );

  const laptopsCount = devices.filter((d) => d.deviceType === 'LAPTOP').length;
  const mobilesCount = devices.filter((d) => d.deviceType === 'SMARTPHONE' || d.deviceType === 'TABLET').length;

  const getDeviceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('laptop') || t.includes('notebook')) return '💻';
    if (t.includes('phone') || t.includes('mobile')) return '📱';
    if (t.includes('tablet') || t.includes('ipad')) return '📟';
    if (t.includes('desktop') || t.includes('pc')) return '🖥️';
    if (t.includes('console')) return '🎮';
    return '⚙️';
  };

  const columns = [
    {
      header: 'Device ID',
      key: 'id',
      width: '90px',
      render: (d) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
          #{d.id}
        </span>
      ),
    },
    {
      header: 'Hardware Unit',
      key: 'model',
      render: (d) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              flexShrink: 0,
            }}
          >
            {getDeviceIcon(d.deviceType)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>
              {d.brand} {d.model}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {d.deviceType || 'Hardware Unit'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Serial Number',
      key: 'serialNumber',
      render: (d) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontWeight: 700, color: '#2563eb' }}>
            {d.serialNumber}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(d.serialNumber);
              toast.success(`Copied S/N: ${d.serialNumber}`);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, display: 'flex' }}
            title="Copy serial number"
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
      header: 'Owner Client',
      key: 'customerId',
      render: (d) => {
        const owner = customers.find((c) => c.id === d.customerId);
        return (
          <div>
            <div style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: 600 }}>
              {owner ? `${owner.firstName} ${owner.lastName}` : `Customer #${d.customerId}`}
            </div>
            {owner && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{owner.email}</div>}
          </div>
        );
      },
    },
    {
      header: 'Registered Date',
      key: 'createdAt',
      render: (d) => (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (d) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          {onViewRepairs && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewRepairs(d)}
            >
              View Repairs
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              style={{ color: '#dc2626', borderColor: '#fecaca' }}
              onClick={() => setDeleteTargetId(d.id)}
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
        title="Hardware Device Inventory"
        subtitle="Manage customer laptops, smartphones, tablets, and computers registered for bench service."
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
            Register Device
          </Button>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard
          title="Total Hardware Items"
          value={devices.length}
          subtitle="All registered inventory"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
            </svg>
          }
          iconColor="#2563eb"
          iconBg="#eff6ff"
        />

        <StatCard
          title="Laptops & PCs"
          value={laptopsCount}
          subtitle="Notebooks & desktops"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="2" y1="20" x2="22" y2="20"></line>
            </svg>
          }
          iconColor="#059669"
          iconBg="#ecfdf5"
        />

        <StatCard
          title="Mobile & Tablets"
          value={mobilesCount}
          subtitle="Smartphones & iPads"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          }
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
        />
      </div>

      {/* Search Toolbar */}
      <Card style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 420 }}>
          <input
            type="text"
            placeholder="Filter hardware by brand, model, serial number, or type..."
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
      {filteredDevices.length === 0 && !loading ? (
        <EmptyState
          title="No hardware devices found"
          description={search ? `No devices match "${search}".` : 'No devices registered in inventory yet.'}
          actionLabel="+ Register Device"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredDevices}
          keyExtractor={(d) => d.id}
          loading={loading}
        />
      )}

      {/* Add Device Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Hardware Item"
        subtitle="Record equipment details and associate with an existing client."
        maxWidth={500}
      >
        <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Owner Customer Account"
            required
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            error={formErrors.customerId}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.firstName} ${c.lastName} (${c.email})`,
            }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Device Brand"
              required
              placeholder="e.g. Apple, Dell"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              error={formErrors.brand}
            />
            <Input
              label="Device Model"
              required
              placeholder="e.g. MacBook Air M2"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              error={formErrors.model}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Serial Number"
              required
              placeholder="e.g. SN-998234"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              error={formErrors.serialNumber}
            />
            <Select
              label="Category"
              required
              value={formData.deviceType}
              onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
              options={[
                { value: 'LAPTOP', label: 'Laptop' },
                { value: 'SMARTPHONE', label: 'Smartphone' },
                { value: 'TABLET', label: 'Tablet' },
                { value: 'DESKTOP', label: 'Desktop PC' },
                { value: 'CONSOLE', label: 'Gaming Console' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={addLoading}>
              Save Hardware Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="Delete Hardware Device Record?"
        message="Permanently remove this hardware entry from inventory? Associated past service history might be impacted."
        confirmText="Delete Device"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
