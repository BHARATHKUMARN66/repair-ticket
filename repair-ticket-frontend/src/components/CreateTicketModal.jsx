import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal, Input, Select, Textarea, Button } from './common';

export function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  // Quick Customer Creation inline state
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });

  // Quick Device Creation inline state
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDev, setNewDev] = useState({ brand: '', model: '', serialNumber: '', deviceType: 'LAPTOP' });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setError(null);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const custList = await api.getCustomers();
      setCustomers(custList || []);
      if (custList && custList.length > 0) {
        setCustomerId(custList[0].id);
        loadCustomerDevices(custList[0].id);
      }
    } catch (err) {
      setError('Could not load customers. Please verify authorization.');
    }
  };

  const loadCustomerDevices = async (cId) => {
    try {
      const devList = await api.getDevicesByCustomer(cId);
      setDevices(devList || []);
      if (devList && devList.length > 0) {
        setDeviceId(devList[0].id);
      } else {
        setDeviceId('');
      }
    } catch (err) {
      setDevices([]);
      setDeviceId('');
    }
  };

  const handleCustomerChange = (e) => {
    const val = e.target.value;
    setCustomerId(val);
    if (val) loadCustomerDevices(val);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.firstName.trim() || !newCust.lastName.trim() || !newCust.email.trim()) {
      toast.error('First name, last name, and email are required.');
      return;
    }
    try {
      const created = await api.createCustomer(newCust);
      setCustomers((prev) => [...prev, created]);
      setCustomerId(created.id);
      setShowAddCustomer(false);
      loadCustomerDevices(created.id);
      toast.success('Customer registered and selected!');
    } catch (err) {
      toast.error(err.message || 'Failed to create customer');
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    if (!newDev.brand.trim() || !newDev.model.trim() || !newDev.serialNumber.trim()) {
      toast.error('Brand, model, and serial number are required.');
      return;
    }
    try {
      const created = await api.createDevice({ ...newDev, customerId: Number(customerId) });
      setDevices((prev) => [...prev, created]);
      setDeviceId(created.id);
      setShowAddDevice(false);
      toast.success('Hardware device registered and selected!');
    } catch (err) {
      toast.error(err.message || 'Failed to register device');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !deviceId || !issueDescription.trim()) {
      setError('Please select a customer, a device, and provide an issue description.');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const payload = {
        customerId: Number(customerId),
        deviceId: Number(deviceId),
        issueDescription: issueDescription.trim(),
        priority,
      };

      await api.createTicket(payload);
      toast.success('Repair ticket created successfully!');
      if (onTicketCreated) onTicketCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Ticket creation failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Repair Ticket"
      subtitle="Dispatch a new hardware work order and assign initial priority."
      maxWidth={520}
    >
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '10px 14px',
            borderRadius: 6,
            marginBottom: 14,
            fontSize: '0.8125rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Customer Select */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Customer Account *
            </label>
            <button
              type="button"
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {showAddCustomer ? 'Cancel' : '+ New Customer'}
            </button>
          </div>

          {showAddCustomer ? (
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  placeholder="First Name"
                  value={newCust.firstName}
                  onChange={(e) => setNewCust({ ...newCust, firstName: e.target.value })}
                  style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newCust.lastName}
                  onChange={(e) => setNewCust({ ...newCust, lastName: e.target.value })}
                  style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
              <Button variant="primary" size="sm" onClick={handleCreateCustomer}>
                Save Customer
              </Button>
            </div>
          ) : (
            <Select
              required
              value={customerId}
              onChange={handleCustomerChange}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName} (${c.email})`,
              }))}
            />
          )}
        </div>

        {/* Hardware Device Select */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
              Customer Hardware Unit *
            </label>
            {customerId && (
              <button
                type="button"
                onClick={() => setShowAddDevice(!showAddDevice)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                {showAddDevice ? 'Cancel' : '+ Register Device'}
              </button>
            )}
          </div>

          {showAddDevice ? (
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Brand (e.g. Apple, Dell)"
                  value={newDev.brand}
                  onChange={(e) => setNewDev({ ...newDev, brand: e.target.value })}
                  style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
                <input
                  type="text"
                  placeholder="Model (e.g. MacBook Pro 14)"
                  value={newDev.model}
                  onChange={(e) => setNewDev({ ...newDev, model: e.target.value })}
                  style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
              </div>
              <input
                type="text"
                placeholder="Serial Number (e.g. C02G41ABMD6M)"
                value={newDev.serialNumber}
                onChange={(e) => setNewDev({ ...newDev, serialNumber: e.target.value })}
                style={{ height: 32, padding: '0 8px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
              />
              <Button variant="primary" size="sm" onClick={handleCreateDevice}>
                Save & Select Device
              </Button>
            </div>
          ) : (
            <Select
              required
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={!customerId || devices.length === 0}
              placeholder={devices.length === 0 ? 'No hardware registered for this client' : 'Select device...'}
              options={devices.map((d) => ({
                value: d.id,
                label: `${d.brand} ${d.model} (S/N: ${d.serialNumber})`,
              }))}
            />
          )}
        </div>

        {/* Urgency Priority */}
        <Select
          label="Urgency Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: 'LOW', label: 'Low - General maintenance / cosmetic' },
            { value: 'MEDIUM', label: 'Medium - Standard bench turnaround' },
            { value: 'HIGH', label: 'High - Expedited business machine' },
            { value: 'URGENT', label: 'Urgent - Emergency escalation' },
          ]}
        />

        {/* Issue Description */}
        <Textarea
          label="Hardware Defect Description"
          required
          rows={3}
          placeholder="Describe symptoms, liquid spill, boot failures, or customer requirements..."
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
          <Button variant="outline" size="md" onClick={onClose} disabled={submitLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={submitLoading}
            disabled={!deviceId || !issueDescription.trim()}
          >
            Dispatch Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
