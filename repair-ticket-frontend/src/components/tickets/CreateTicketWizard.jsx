import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Button, PriorityBadge, Modal } from '../common';

const WIZARD_STEPS = [
  { step: 1, title: 'Customer', desc: 'Client Identification' },
  { step: 2, title: 'Device', desc: 'Hardware Unit' },
  { step: 3, title: 'Issue & SLA', desc: 'Problem Description' },
  { step: 4, title: 'Specialist', desc: 'Bench Allocation' },
  { step: 5, title: 'Review', desc: 'Final Verification' },
];

export function CreateTicketWizard({ isOpen, onClose, onTicketCreated }) {
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data lists
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Form selections
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState('');

  // Inline Quick Creation Toggles
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCust, setNewCust] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', address: '' });

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDev, setNewDev] = useState({ brand: '', model: '', serialNumber: '', deviceType: 'LAPTOP' });

  // Load Customers & Active Technicians
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setError(null);
      setSelectedCustomerId('');
      setSelectedDeviceId('');
      setIssueDescription('');
      setPriority('MEDIUM');
      setAssignedTechnicianId('');
      setShowAddCustomer(false);
      setShowAddDevice(false);

      Promise.all([
        api.getCustomers().catch(() => []),
        api.getActiveTechnicians().catch(() => []),
      ]).then(([custList, techList]) => {
        setCustomers(custList || []);
        setTechnicians(techList || []);
      });
    }
  }, [isOpen]);

  // When customer changes, load their devices
  const loadCustomerDevices = async (custId) => {
    if (!custId) {
      setDevices([]);
      setSelectedDeviceId('');
      return;
    }
    try {
      const devList = await api.getDevicesByCustomer(custId);
      setDevices(devList || []);
      if (devList && devList.length > 0) {
        setSelectedDeviceId(devList[0].id);
      } else {
        setSelectedDeviceId('');
      }
    } catch (e) {
      setDevices([]);
      setSelectedDeviceId('');
    }
  };

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    loadCustomerDevices(id);
  };

  // Inline Customer Creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCust.firstName.trim() || !newCust.lastName.trim() || !newCust.email.trim()) {
      toast.error('First name, last name, and email are required.');
      return;
    }
    try {
      const created = await api.createCustomer(newCust);
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomerId(created.id);
      setShowAddCustomer(false);
      loadCustomerDevices(created.id);
      toast.success('Customer profile registered and selected');
    } catch (err) {
      toast.error(err.message || 'Customer creation failed');
    }
  };

  // Inline Device Creation
  const handleCreateDevice = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return;
    if (!newDev.brand.trim() || !newDev.model.trim() || !newDev.serialNumber.trim()) {
      toast.error('Brand, model, and serial number are required.');
      return;
    }
    try {
      const created = await api.createDevice({ ...newDev, customerId: Number(selectedCustomerId) });
      setDevices((prev) => [...prev, created]);
      setSelectedDeviceId(created.id);
      setShowAddDevice(false);
      toast.success('Hardware device registered and selected');
    } catch (err) {
      toast.error(err.message || 'Device registration failed');
    }
  };

  // Validation before step advances
  const canAdvance = () => {
    if (currentStep === 1) return Boolean(selectedCustomerId);
    if (currentStep === 2) return Boolean(selectedDeviceId);
    if (currentStep === 3) return Boolean(issueDescription.trim());
    if (currentStep === 4) return true; // specialist assignment is optional
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) {
      if (currentStep === 1) toast.error('Please select or create a customer.');
      else if (currentStep === 2) toast.error('Please select or register a hardware device.');
      else if (currentStep === 3) toast.error('Please describe the reported issue.');
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Final Submission
  const handleSubmitTicket = async () => {
    if (!selectedCustomerId || !selectedDeviceId || !issueDescription.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerId: Number(selectedCustomerId),
        deviceId: Number(selectedDeviceId),
        issueDescription: issueDescription.trim(),
        priority,
      };

      const createdTicket = await api.createTicket(payload);

      // If a specialist was selected in Step 4, assign them now
      if (assignedTechnicianId) {
        try {
          await api.assignTechnician(createdTicket.id, Number(assignedTechnicianId), 'Assigned during ticket intake creation');
        } catch (assignErr) {
          console.warn('Technician auto-assignment notice:', assignErr);
        }
      }

      toast.success(`Service ticket ${createdTicket.ticketNumber} created successfully!`);
      if (onTicketCreated) onTicketCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Ticket creation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => String(c.id) === String(selectedCustomerId));
  const selectedDevice = devices.find((d) => String(d.id) === String(selectedDeviceId));
  const selectedTech = technicians.find((t) => String(t.id) === String(assignedTechnicianId));

  return (
    <div
      className="modal-backdrop-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 620,
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
          animation: 'modalZoomIn 0.18s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Dispatch New Repair Ticket
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
              Multi-step intake wizard & work order generator
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        {/* 5-Step Visual Stepper Bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, left: 24, right: 24, height: 2, background: '#e2e8f0', zIndex: 0 }} />

            {WIZARD_STEPS.map((s) => {
              const isCompleted = s.step < currentStep;
              const isCurrent = s.step === currentStep;

              return (
                <div
                  key={s.step}
                  onClick={() => {
                    if (s.step < currentStep) setCurrentStep(s.step);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    position: 'relative',
                    zIndex: 1,
                    cursor: s.step < currentStep ? 'pointer' : 'default',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isCurrent ? '#2563eb' : isCompleted ? '#10b981' : '#ffffff',
                      color: isCompleted ? '#ffffff' : isCurrent ? '#ffffff' : '#94a3b8',
                      border: `2px solid ${isCurrent ? '#2563eb' : isCompleted ? '#10b981' : '#cbd5e1'}`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
                    }}
                  >
                    {isCompleted ? '✓' : s.step}
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#0f172a' : '#64748b' }}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div style={{ padding: 24, overflowY: 'auto', flexGrow: 1 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 14px', color: '#b91c1c', fontSize: '0.8125rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* STEP 1: CUSTOMER */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  Select Customer Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {showAddCustomer ? '← Choose Existing' : '+ Register New Customer'}
                </button>
              </div>

              {!showAddCustomer ? (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    style={{
                      width: '100%',
                      height: 40,
                      padding: '0 12px',
                      fontSize: '0.875rem',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    <option value="">Select registered client...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.email})
                      </option>
                    ))}
                  </select>

                  {selectedCustomer && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginTop: 14 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#2563eb', marginTop: 2 }}>{selectedCustomer.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                        Phone: {selectedCustomer.phoneNumber || 'N/A'} • ID: #{selectedCustomer.id}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={newCust.firstName}
                      onChange={(e) => setNewCust({ ...newCust, firstName: e.target.value })}
                      required
                      style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={newCust.lastName}
                      onChange={(e) => setNewCust({ ...newCust, lastName: e.target.value })}
                      required
                      style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    required
                    style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newCust.phoneNumber}
                    onChange={(e) => setNewCust({ ...newCust, phoneNumber: e.target.value })}
                    style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                  <Button variant="primary" size="sm" type="submit" style={{ alignSelf: 'flex-start' }}>
                    Save & Select Customer
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* STEP 2: DEVICE */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  Select Hardware Unit
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddDevice(!showAddDevice)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {showAddDevice ? '← Choose Existing' : '+ Register New Device'}
                </button>
              </div>

              {!showAddDevice ? (
                <div>
                  {devices.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, color: '#64748b', fontSize: '0.84rem' }}>
                      No devices on file for this customer.
                      <div style={{ marginTop: 8 }}>
                        <Button variant="outline" size="sm" onClick={() => setShowAddDevice(true)}>
                          + Register Hardware Unit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        style={{
                          width: '100%',
                          height: 40,
                          padding: '0 12px',
                          fontSize: '0.875rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          outline: 'none',
                        }}
                      >
                        <option value="">Select hardware unit...</option>
                        {devices.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.brand} {d.model} (S/N: {d.serialNumber || 'N/A'})
                          </option>
                        ))}
                      </select>

                      {selectedDevice && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginTop: 14 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                            {selectedDevice.brand} {selectedDevice.model}
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#64748b', marginTop: 3 }}>
                            S/N: {selectedDevice.serialNumber || 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreateDevice} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Brand (e.g. Apple, Dell) *"
                      value={newDev.brand}
                      onChange={(e) => setNewDev({ ...newDev, brand: e.target.value })}
                      required
                      style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                    <input
                      type="text"
                      placeholder="Model (e.g. MacBook Pro 16) *"
                      value={newDev.model}
                      onChange={(e) => setNewDev({ ...newDev, model: e.target.value })}
                      required
                      style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Serial Number *"
                    value={newDev.serialNumber}
                    onChange={(e) => setNewDev({ ...newDev, serialNumber: e.target.value })}
                    required
                    style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                  <select
                    value={newDev.deviceType}
                    onChange={(e) => setNewDev({ ...newDev, deviceType: e.target.value })}
                    style={{ height: 36, padding: '0 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  >
                    <option value="LAPTOP">Laptop / Notebook</option>
                    <option value="SMARTPHONE">Smartphone</option>
                    <option value="TABLET">Tablet / iPad</option>
                    <option value="DESKTOP">Desktop Workstation</option>
                  </select>
                  <Button variant="primary" size="sm" type="submit" style={{ alignSelf: 'flex-start' }}>
                    Save & Select Device
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: ISSUE & PRIORITY */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                  Reported Problem & Symptoms *
                </label>
                <textarea
                  placeholder="Describe hardware symptoms, boot behavior, physical damage, or customer-reported defects..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  rows={4}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '0.84rem',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 8 }}>
                  Urgency SLA Priority Level
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { id: 'LOW', label: 'Low', desc: '5–7 Days SLA' },
                    { id: 'MEDIUM', label: 'Medium', desc: '3–5 Days SLA' },
                    { id: 'HIGH', label: 'High', desc: '1–2 Days SLA' },
                    { id: 'URGENT', label: 'Urgent', desc: '24hr Emergency' },
                  ].map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 6,
                          border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: isSelected ? '#2563eb' : '#0f172a' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 2 }}>{p.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TECHNICIAN ASSIGNMENT (OPTIONAL) */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Bench Specialist Dispatch (Optional)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Optionally assign a certified bench technician right now, or leave unassigned to place this ticket in the facility intake pool.
              </div>

              <select
                value={assignedTechnicianId}
                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px',
                  fontSize: '0.875rem',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="">Leave Unassigned (Facility Intake Pool)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.specialization || 'Hardware Technician'})
                  </option>
                ))}
              </select>

              {selectedTech && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                    Specialist: {selectedTech.firstName} {selectedTech.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    Specialization: {selectedTech.specialization || 'General Hardware'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                Review Work Order Summary
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Customer</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{selectedCustomer?.email}</div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Hardware Unit</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {selectedDevice ? `${selectedDevice.brand} ${selectedDevice.model}` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>
                      S/N: {selectedDevice?.serialNumber}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Reported Problem</div>
                  <div style={{ fontSize: '0.84rem', color: '#0f172a', marginTop: 3, lineHeight: 1.4 }}>{issueDescription}</div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Priority SLA</div>
                    <div style={{ marginTop: 4 }}>
                      <PriorityBadge priority={priority} size="sm" />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>Assigned Specialist</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: selectedTech ? '#0f172a' : '#94a3b8', marginTop: 3 }}>
                      {selectedTech ? `${selectedTech.firstName} ${selectedTech.lastName}` : 'Unassigned (Pool)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {currentStep > 1 ? (
            <Button variant="secondary" size="sm" onClick={handleBack} disabled={loading}>
              ← Back
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          )}

          {currentStep < 5 ? (
            <Button variant="primary" size="sm" onClick={handleNext} disabled={!canAdvance()}>
              Continue →
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleSubmitTicket} loading={loading}>
              Confirm & Dispatch Ticket
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
