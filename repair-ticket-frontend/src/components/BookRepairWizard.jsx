import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, Textarea, Card } from './common';

const ISSUE_CATEGORIES = [
  { id: 'DISPLAY', label: 'Screen / Display', icon: '🖥️' },
  { id: 'BATTERY', label: 'Battery / Power', icon: '🔋' },
  { id: 'LOGIC_BOARD', label: 'Logic Board / Chip', icon: '⚡' },
  { id: 'LIQUID_DAMAGE', label: 'Liquid Damage', icon: '💧' },
  { id: 'SOFTWARE', label: 'OS / Software', icon: '💾' },
  { id: 'OTHER', label: 'Other Diagnostics', icon: '🔧' },
];

const TURNAROUND_OPTIONS = [
  {
    id: 'LOW',
    title: 'Standard Service',
    turnaround: '3–5 Business Days',
    desc: 'Standard diagnostic and bench queue order.',
    badge: 'Standard SLA',
  },
  {
    id: 'MEDIUM',
    title: 'Expedited Service',
    turnaround: '1–2 Business Days',
    desc: 'Priority queue placement with faster component sourcing.',
    badge: 'Recommended',
  },
  {
    id: 'HIGH',
    title: 'Urgent Service',
    turnaround: 'Next Business Day',
    desc: 'Direct bench dispatch and expedited technician allocation.',
    badge: 'Urgent',
  },
  {
    id: 'URGENT',
    title: 'Emergency 24-Hour',
    turnaround: 'Same-Day / 24 Hours',
    desc: 'Dedicated bench specialist assigned immediately upon intake.',
    badge: 'Critical 24h',
  },
];

const getDeviceIcon = (deviceType) => {
  const type = (deviceType || '').toUpperCase();
  if (type.includes('LAPTOP')) return '💻';
  if (type.includes('PHONE') || type.includes('SMARTPHONE')) return '📱';
  if (type.includes('TABLET')) return '📟';
  if (type.includes('DESKTOP') || type.includes('PC')) return '🖥️';
  return '⚙️';
};

export function BookRepairWizard({ customer, preselectedDeviceId, onTicketCreated, onCancel, onTrackTicket }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  // Step 1: Device State
  const [deviceMode, setDeviceMode] = useState('existing'); // 'existing' | 'new'
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [newDevice, setNewDevice] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    deviceType: 'LAPTOP',
  });
  const [deviceErrors, setDeviceErrors] = useState({});

  // Step 2: Problem State
  const [issueCategory, setIssueCategory] = useState('DISPLAY');
  const [issueDescription, setIssueDescription] = useState('');
  const [problemError, setProblemError] = useState(null);

  // Step 3: Priority State
  const [priority, setPriority] = useState('MEDIUM');

  // Load customer's existing devices
  useEffect(() => {
    if (customer?.id) {
      setLoadingDevices(true);
      api.getDevicesByCustomer(customer.id)
        .then((data) => {
          setDevices(data || []);
          if (data && data.length > 0) {
            setDeviceMode('existing');
            const matched = preselectedDeviceId
              ? data.find((d) => String(d.id) === String(preselectedDeviceId))
              : null;
            setSelectedDeviceId(matched ? matched.id : data[0].id);
          } else {
            setDeviceMode('new');
          }
        })
        .catch((err) => {
          console.warn('Could not load devices:', err);
          setDeviceMode('new');
        })
        .finally(() => setLoadingDevices(false));
    } else {
      setDeviceMode('new');
    }
  }, [customer, preselectedDeviceId]);

  const validateStep1 = () => {
    const errs = {};
    if (deviceMode === 'existing') {
      if (!selectedDeviceId) {
        errs.selectedDevice = 'Please select a hardware device from your registered list.';
      }
    } else {
      if (!newDevice.brand.trim()) errs.brand = 'Brand is required (e.g. Apple, Dell, Lenovo).';
      if (!newDevice.model.trim()) errs.model = 'Model is required (e.g. MacBook Pro 14", XPS 15).';
      if (!newDevice.serialNumber.trim()) {
        errs.serialNumber = 'Serial number is required.';
      } else if (newDevice.serialNumber.trim().length < 3) {
        errs.serialNumber = 'Serial number must be at least 3 characters.';
      }
    }
    setDeviceErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    if (!issueDescription.trim()) {
      setProblemError('Problem description is required.');
      return false;
    }
    if (issueDescription.trim().length < 10) {
      setProblemError('Problem description must contain at least 10 characters.');
      return false;
    }
    setProblemError(null);
    return true;
  };

  const handleNextStep = () => {
    setError(null);
    if (step === 1) {
      if (!validateStep1()) return;
    } else if (step === 2) {
      if (!validateStep2()) return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let activeCustomerId = customer?.id;

      // 1. If customer entity doesn't exist yet, create it now for the current user
      if (!activeCustomerId) {
        const newCustomer = await api.createCustomer({
          firstName: user?.fullName?.split(' ')[0] || user?.username || 'Customer',
          lastName: user?.fullName?.split(' ').slice(1).join(' ') || 'Client',
          email: `${user?.username}@omniclient.io`,
          phoneNumber: '+1-555-0100',
          address: 'OmniFix Registered Client',
        });
        activeCustomerId = newCustomer.id;
      }

      // 2. Resolve Device ID (use existing or register new)
      let activeDeviceId = selectedDeviceId;
      if (deviceMode === 'new') {
        const registeredDevice = await api.createDevice({
          brand: newDevice.brand.trim(),
          model: newDevice.model.trim(),
          serialNumber: newDevice.serialNumber.trim(),
          deviceType: newDevice.deviceType,
          customerId: activeCustomerId,
        });
        activeDeviceId = registeredDevice.id;
      }

      // 3. Create the Repair Ticket
      const fullDescription = `[Category: ${issueCategory}] ${issueDescription.trim()}`;
      const ticket = await api.createTicket({
        customerId: activeCustomerId,
        deviceId: activeDeviceId,
        issueDescription: fullDescription,
        priority: priority,
      });

      setCreatedTicket(ticket);
      setStep(5); // Completion View
      if (onTicketCreated) onTicketCreated(ticket);
    } catch (err) {
      setError(err.message || 'Failed to submit repair request. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resolve summary device label
  const getSelectedDeviceSummary = () => {
    if (deviceMode === 'existing') {
      const dev = devices.find((d) => String(d.id) === String(selectedDeviceId));
      return dev ? `${dev.brand} ${dev.model} (S/N: ${dev.serialNumber})` : 'Selected Device';
    }
    return `${newDevice.brand} ${newDevice.model} (S/N: ${newDevice.serialNumber})`;
  };

  const stepsConfig = [
    { num: 1, label: 'Hardware Unit' },
    { num: 2, label: 'Fault Details' },
    { num: 3, label: 'Service SLA' },
    { num: 4, label: 'Review Order' },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 24 }}>
      {/* Wizard Header */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8 }}>
          <span>🛠️</span>
          <span>OmniFix Service Intake</span>
        </div>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
          Schedule Hardware Repair
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
          Register your hardware unit, describe failure symptoms, and select diagnostic priority for rapid bench allocation.
        </p>
      </div>

      {/* Horizontal Step Indicator */}
      {step <= 4 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
            padding: '14px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {stepsConfig.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <React.Fragment key={s.num}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background:
                        isCompleted ? '#10b981' :
                        isCurrent ? '#2563eb' : '#f8fafc',
                      color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                      border: `2px solid ${
                        isCompleted ? '#10b981' :
                        isCurrent ? '#2563eb' : '#cbd5e1'
                      }`,
                      boxShadow: isCurrent ? '0 0 0 3px rgba(37, 99, 235, 0.18)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                        color: isCurrent ? '#2563eb' : isCompleted ? '#0f172a' : '#94a3b8',
                        lineHeight: 1.1,
                      }}
                    >
                      {s.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: 1 }}>
                      Step {s.num} of 4
                    </div>
                  </div>
                </div>

                {idx < stepsConfig.length - 1 && (
                  <div
                    style={{
                      flexGrow: 1,
                      maxWidth: 48,
                      height: 2,
                      background: step > s.num ? '#10b981' : '#e2e8f0',
                      margin: '0 8px',
                      borderRadius: 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 6,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {/* STEP 1: DEVICE SELECTION */}
      {step === 1 && (
        <Card title="Step 1: Hardware Device Selection" subtitle="Choose an existing device from your profile or register a new unit">
          {/* Mode Switcher */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {devices.length > 0 && (
              <label
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 6,
                  border: `1px solid ${deviceMode === 'existing' ? '#2563eb' : '#cbd5e1'}`,
                  background: deviceMode === 'existing' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <input
                  type="radio"
                  name="deviceMode"
                  checked={deviceMode === 'existing'}
                  onChange={() => setDeviceMode('existing')}
                />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    Select Existing Device ({devices.length})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Choose from devices already on your account
                  </div>
                </div>
              </label>
            )}

            <label
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: 6,
                border: `1px solid ${deviceMode === 'new' ? '#2563eb' : '#cbd5e1'}`,
                background: deviceMode === 'new' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <input
                type="radio"
                name="deviceMode"
                checked={deviceMode === 'new'}
                onChange={() => setDeviceMode('new')}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  + Register New Device
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Add a new laptop, phone, or computer
                </div>
              </div>
            </label>
          </div>

          {/* Existing Device Dropdown & Automatic Info Card */}
          {deviceMode === 'existing' && (
            <div style={{ marginBottom: 16 }}>
              <Select
                label="Select Registered Device"
                required
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                error={deviceErrors.selectedDevice}
                options={devices.map((d) => ({
                  value: d.id,
                  label: `${d.brand} ${d.model} (S/N: ${d.serialNumber})`,
                }))}
              />

              {/* Automatically display device specs */}
              {(() => {
                const currentDev = devices.find((d) => String(d.id) === String(selectedDeviceId));
                if (!currentDev) return null;
                return (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '12px 16px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.75rem' }}>{getDeviceIcon(currentDev.deviceType)}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                          {currentDev.brand} {currentDev.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Category: {currentDev.deviceType || 'Hardware Unit'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Serial Number</div>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', fontSize: '0.875rem' }}>
                        {currentDev.serialNumber}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* New Device Form */}
          {deviceMode === 'new' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <Input
                  label="Device Brand"
                  required
                  placeholder="e.g. Apple, Dell, Lenovo"
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
                  error={deviceErrors.brand}
                />
                <Input
                  label="Device Model"
                  required
                  placeholder="e.g. MacBook Pro 14-inch M2"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                  error={deviceErrors.model}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <Input
                  label="Hardware Serial Number"
                  required
                  placeholder="e.g. C02G41ABMD6M"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                  error={deviceErrors.serialNumber}
                  helperText="Printed on bottom casing or in system settings"
                />
                <Select
                  label="Hardware Category"
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
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            {onCancel ? (
              <Button variant="outline" size="md" onClick={onCancel}>
                Cancel
              </Button>
            ) : <div />}
            <Button variant="primary" size="md" onClick={handleNextStep}>
              Next: Problem Details &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: PROBLEM DESCRIPTION */}
      {step === 2 && (
        <Card title="Step 2: Issue & Symptoms" subtitle="Describe the defect symptoms to aid bench technicians in diagnosis">
          {/* Issue Category Radio Pills */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
              Primary Issue Category *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = issueCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setIssueCategory(cat.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'left',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description Textarea */}
          <Textarea
            label="Detailed Problem Description"
            required
            placeholder="Explain symptoms, when the fault occurs, any error codes, or physical damage (e.g. Battery drains in 30 minutes; power shuts down unexpectedly when rendering video)..."
            rows={5}
            value={issueDescription}
            onChange={(e) => {
              setIssueDescription(e.target.value);
              if (problemError) setProblemError(null);
            }}
            error={problemError}
            maxLength={500}
            showCharCount={true}
          />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <Button variant="outline" size="md" onClick={handlePrevStep}>
              &larr; Back to Device
            </Button>
            <Button variant="primary" size="md" onClick={handleNextStep}>
              Next: Turnaround SLA &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: PRIORITY & TURNAROUND */}
      {step === 3 && (
        <Card title="Step 3: Service Priority & Turnaround" subtitle="Select the required bench dispatch turnaround window">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TURNAROUND_OPTIONS.map((opt) => {
              const isSelected = priority === opt.id;
              return (
                <label
                  key={opt.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
                    transition: 'all 120ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="radio"
                      name="priorityOption"
                      checked={isSelected}
                      onChange={() => setPriority(opt.id)}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                          {opt.title}
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                          }}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#334155' }}>
                      {opt.turnaround}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <Button variant="outline" size="md" onClick={handlePrevStep}>
              &larr; Back to Problem
            </Button>
            <Button variant="primary" size="md" onClick={handleNextStep}>
              Next: Review Request &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRMATION */}
      {step === 4 && (
        <Card title="Step 4: Review Service Order" subtitle="Please verify your hardware details and symptoms before submitting to the bench queue">
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              padding: '22px 24px',
              marginBottom: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: 14, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                  Service Requisition Form
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  Bench Work Order Summary
                </div>
              </div>
              <div style={{ padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, color: '#2563eb', fontSize: '0.75rem', fontWeight: 700 }}>
                Draft • Pending Submission
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Client Account</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                  {user?.fullName || user?.username}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Hardware Unit</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                  {getSelectedDeviceSummary()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Issue Category</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 3 }}>
                  {ISSUE_CATEGORIES.find((c) => c.id === issueCategory)?.icon} {ISSUE_CATEGORIES.find((c) => c.id === issueCategory)?.label || issueCategory}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Turnaround SLA</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563eb', marginTop: 3 }}>
                  {TURNAROUND_OPTIONS.find((t) => t.id === priority)?.title} ({TURNAROUND_OPTIONS.find((t) => t.id === priority)?.turnaround})
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: 6 }}>
                Reported Failure Symptoms
              </div>
              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px' }}>
                {issueDescription}
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#64748b' }}>
              <span>ℹ️</span>
              <span>Upon submission, an official tracking code is generated for bench queue scheduling and real-time status monitoring.</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <Button variant="outline" size="md" onClick={handlePrevStep} disabled={submitting}>
              &larr; Back to Priority
            </Button>
            <Button variant="primary" size="md" loading={submitting} onClick={handleSubmit} style={{ fontWeight: 700, padding: '0 24px' }}>
              Confirm & Submit Repair Order
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: SUCCESS / CONFIRMED TICKET */}
      {step === 5 && createdTicket && (
        <Card style={{ textAlign: 'center', padding: '36px 24px', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.06)' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#059669',
              border: '2.5px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              marginBottom: 16,
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.15)',
            }}
          >
            ✓
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Repair Request Registered
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Your hardware service ticket has been routed to the OmniFix intake desk. A specialist will verify hardware diagnostics and initiate bench service.
          </p>

          {/* Ticket Receipt Highlight Card */}
          <div
            style={{
              maxWidth: 440,
              margin: '0 auto 28px',
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: 10,
              padding: '16px 20px',
              textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em' }}>
                Service Tracking Code
              </span>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                OPEN / INTAKE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '1.15rem', fontWeight: 800, color: '#2563eb' }}>
                {createdTicket.ticketNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(createdTicket.ticketNumber)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#475569',
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
                title="Copy tracking code"
              >
                {copied ? (
                  <span style={{ color: '#059669', fontWeight: 700 }}>Copied!</span>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>Turnaround Priority:</span>
              <strong style={{ color: '#0f172a' }}>{createdTicket.priority || priority} SLA</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {onTrackTicket && (
              <Button
                variant="outline"
                size="md"
                onClick={() => onTrackTicket(createdTicket.ticketNumber)}
                style={{ fontWeight: 600 }}
              >
                🔍 Track Live Diagnostics
              </Button>
            )}
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (onCancel) onCancel();
              }}
              style={{ fontWeight: 700 }}
            >
              Return to My Repairs
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
