import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Input, Select, Card, EmptyState } from './common';

export function MyDevices({
  customer,
  tickets = [],
  onDeviceUpdated,
  onBookRepair,
  onViewRepairs,
}) {
  const toast = useToast();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const [newDevice, setNewDevice] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    deviceType: 'LAPTOP',
  });

  const fetchDevices = async () => {
    if (!customer?.id) {
      setDevices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.getDevicesByCustomer(customer.id);
      setDevices(data || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [customer]);

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newDevice.brand.trim()) errs.brand = 'Brand is required (e.g. Apple, Dell).';
    if (!newDevice.model.trim()) errs.model = 'Model is required (e.g. MacBook Pro 16", XPS 15).';
    if (!newDevice.serialNumber.trim()) {
      errs.serialNumber = 'Serial number is required.';
    } else if (newDevice.serialNumber.trim().length < 3) {
      errs.serialNumber = 'Serial number must be at least 3 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    setFormErrors({});
    try {
      await api.createDevice({
        brand: newDevice.brand.trim(),
        model: newDevice.model.trim(),
        serialNumber: newDevice.serialNumber.trim(),
        deviceType: newDevice.deviceType,
        customerId: customer.id,
      });
      setIsAdding(false);
      setNewDevice({ brand: '', model: '', serialNumber: '', deviceType: 'LAPTOP' });
      toast.success('Hardware device registered successfully!');
      fetchDevices();
      if (onDeviceUpdated) onDeviceUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to register device.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopySerial = (e, id, sn) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sn);
    setCopiedId(id);
    toast.success('Serial number copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'LAPTOP': return '💻';
      case 'SMARTPHONE': return '📱';
      case 'TABLET': return '📟';
      case 'DESKTOP': return '🖥️';
      case 'CONSOLE': return '🎮';
      default: return '⚙️';
    }
  };

  return (
    <div>
      {/* Header with Title and + Register Device button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
            My Registered Hardware Devices
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Devices linked to your customer profile for one-click service bookings.
          </p>
        </div>

        <Button
          variant={isAdding ? 'outline' : 'primary'}
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          icon={
            !isAdding ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            ) : null
          }
        >
          {isAdding ? 'Cancel Registration' : '+ Register Device'}
        </Button>
      </div>

      {/* Inline Device Registration Card */}
      {isAdding && (
        <Card
          title="Register Hardware Unit"
          subtitle="Add your laptop, phone, or computer for fast service dispatch"
          style={{ marginBottom: 20 }}
        >
          <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <Input
                label="Device Brand"
                required
                placeholder="e.g. Apple, Dell, Lenovo"
                value={newDevice.brand}
                onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
                error={formErrors.brand}
              />

              <Input
                label="Device Model"
                required
                placeholder="e.g. MacBook Pro 16, XPS 15"
                value={newDevice.model}
                onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                error={formErrors.model}
              />

              <Input
                label="Serial Number"
                required
                placeholder="e.g. C02M3MAX99"
                value={newDevice.serialNumber}
                onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                error={formErrors.serialNumber}
              />

              <Select
                label="Category"
                required
                value={newDevice.deviceType}
                onChange={(e) => setNewDevice({ ...newDevice, deviceType: e.target.value })}
                options={[
                  { value: 'LAPTOP', label: 'Laptop / Notebook' },
                  { value: 'SMARTPHONE', label: 'Smartphone' },
                  { value: 'TABLET', label: 'Tablet / iPad' },
                  { value: 'DESKTOP', label: 'Desktop PC / Mac' },
                  { value: 'CONSOLE', label: 'Gaming Console' },
                  { value: 'OTHER', label: 'Other Hardware' },
                ]}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={saving}>
                Save Device
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Devices Presentation: Rich Modern Cards (not generic CRUD table) */}
      {devices.length === 0 && !loading ? (
        <EmptyState
          title="No hardware registered"
          description="Register a device to make future repair requests faster."
          actionLabel="+ Register Device"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <div
          className="device-cards-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {devices.map((d) => {
            const deviceTickets = tickets.filter((t) => t.deviceId === d.id);
            const repairHistoryCount = deviceTickets.length;
            const activeRepair = deviceTickets.find((t) =>
              ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)
            );
            const isPickup = deviceTickets.find((t) => t.status === 'REPAIR_COMPLETED');

            const statusText = isPickup
              ? 'Ready for Pickup'
              : activeRepair
              ? 'In Active Repair'
              : 'Available';

            const statusBg = isPickup
              ? '#ecfdf5'
              : activeRepair
              ? '#fffbeb'
              : '#f0fdf4';

            const statusColor = isPickup
              ? '#059669'
              : activeRepair
              ? '#b45309'
              : '#15803d';

            const statusBorder = isPickup
              ? '#a7f3d0'
              : activeRepair
              ? '#fde68a'
              : '#bbf7d0';

            return (
              <div
                key={d.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.03)';
                }}
              >
                <div>
                  {/* Card Header: Category Icon + Brand/Model + Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0,
                        }}
                      >
                        {getCategoryIcon(d.deviceType)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>
                          {d.brand} {d.model}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {d.deviceType || 'Hardware Unit'}
                        </div>
                      </div>
                    </div>

                    {/* Live Status Pill */}
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 12,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusBorder}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: statusColor,
                        }}
                      />
                      {statusText}
                    </span>
                  </div>

                  {/* Serial Number Row */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: '1px solid #f1f5f9',
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                      Serial Number:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.84rem' }}>
                        {d.serialNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopySerial(e, d.id, d.serialNumber)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                        title="Copy Serial Number"
                      >
                        {copiedId === d.id ? (
                          <span style={{ fontSize: '0.6875rem', color: '#059669', fontWeight: 700 }}>Copied!</span>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Repair History Count Metric */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: 14 }}>
                    <span>Service Track Record:</span>
                    <span style={{ fontWeight: 700, color: repairHistoryCount > 0 ? '#0f172a' : '#94a3b8' }}>
                      {repairHistoryCount} {repairHistoryCount === 1 ? 'repair order' : 'repair orders'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                  }}
                >
                  {onViewRepairs && repairHistoryCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewRepairs(d.id)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      View Repairs ({repairHistoryCount})
                    </Button>
                  )}

                  {onBookRepair && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onBookRepair(d.id)}
                      icon={
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      }
                      style={{ fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      Request Repair
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
