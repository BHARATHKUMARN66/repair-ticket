/**
 * OmniFix API Service
 * 
 * Centralized HTTP client managing JWT token injection, JSON parsing,
 * query parameter formatting, and error extraction.
 */
// In production on Render, VITE_API_URL points to the backend web service (e.g., https://my-backend.onrender.com/api)
// In local development, defaults to '/api' which Vite proxies to http://localhost:8082
const envApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = envApiUrl
  ? (envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('omni_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const validationMap = data?.validationErrors || data?.fieldErrors;
      const validationSummary = validationMap ? Object.values(validationMap).join(' • ') : null;
      const errorMessage = validationSummary || data?.message || data?.error || `HTTP Error ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.fieldErrors = validationMap;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Request Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (username, password) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (userData) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Tickets
  getTickets: (criteria = {}) => {
    const query = new URLSearchParams();
    Object.entries(criteria).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/tickets${queryString}`);
  },

  getTicketById: (id) => request(`/tickets/${id}`),

  getTicketByNumber: (ticketNumber) => request(`/tickets/number/${encodeURIComponent(ticketNumber)}`),

  createTicket: (ticketData) => 
    request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    }),

  updateTicketStatus: (ticketId, status, notes) => 
    request(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ newStatus: status, notes }),
    }),

  cancelTicket: (ticketId, reason) =>
    request(`/tickets/${ticketId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  assignTechnician: (ticketId, technicianId, assignmentNotes) => 
    request(`/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ technicianId, assignmentNotes }),
    }),

  unassignTechnician: (ticketId, notes) => 
    request(`/tickets/${ticketId}/unassign${notes ? `?notes=${encodeURIComponent(notes)}` : ''}`, {
      method: 'POST',
    }),

  deleteTicket: (id) => 
    request(`/tickets/${id}`, { method: 'DELETE' }),

  // Ticket Progress / Audit Updates
  getTicketUpdates: (ticketId) => 
    request(`/tickets/${ticketId}/updates`),

  getPublicTicketUpdates: (ticketNumber) => 
    request(`/tickets/number/${encodeURIComponent(ticketNumber)}/updates`),

  addTicketUpdate: (ticketId, notes) => 
    request(`/tickets/${ticketId}/updates`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Customers
  getCustomers: () => request('/customers'),
  
  getCustomerById: (id) => request(`/customers/${id}`),

  getCustomerByEmail: (email) => request(`/customers/by-email?email=${encodeURIComponent(email)}`),

  getTicketsByCustomer: (customerId) => request(`/tickets/customer/${customerId}`),

  getTicketsByTechnician: (technicianId) => request(`/tickets/technician/${technicianId}`),

  createCustomer: (customerData) => 
    request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    }),

  updateCustomer: (id, customerData) => 
    request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    }),

  deleteCustomer: (id) => 
    request(`/customers/${id}`, { method: 'DELETE' }),

  // Devices
  getDevices: () => request('/devices'),

  getDevicesByCustomer: (customerId) => request(`/devices/customer/${customerId}`),

  createDevice: (deviceData) => 
    request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    }),

  updateDevice: (id, deviceData) => 
    request(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    }),

  deleteDevice: (id) => 
    request(`/devices/${id}`, { method: 'DELETE' }),

  // Technicians
  getTechnicians: () => request('/technicians'),

  getActiveTechnicians: () => request('/technicians/active'),

  createTechnician: (techData) => 
    request('/technicians', {
      method: 'POST',
      body: JSON.stringify(techData),
    }),

  updateTechnician: (id, techData) => 
    request(`/technicians/${id}`, {
      method: 'PUT',
      body: JSON.stringify(techData),
    }),

  toggleTechnicianStatus: (id) => 
    request(`/technicians/${id}/status`, { method: 'PATCH' }),

  deleteTechnician: (id) => 
    request(`/technicians/${id}`, { method: 'DELETE' }),
};
