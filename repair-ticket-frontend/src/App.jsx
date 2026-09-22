import React, { useState, useEffect } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';
import { useRouter } from './hooks/useRouter';
import { AppLayout } from './components/layout';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { TechnicianLoginPage } from './pages/TechnicianLoginPage';
import { PublicTracker } from './components/PublicTracker';
import { TicketList } from './components/TicketList';
import { CustomerPortal } from './components/CustomerPortal';
import { TechnicianWorkbench } from './components/TechnicianWorkbench';
import { CustomerManager } from './components/CustomerManager';
import { DeviceManager } from './components/DeviceManager';
import { TechnicianManager } from './components/TechnicianManager';

// Modern UI/UX Overhaul Components
import { TicketDrawer } from './components/tickets/TicketDrawer';
import { TicketWorkspaceModal } from './components/tickets/TicketWorkspaceModal';
import { CreateTicketWizard } from './components/tickets/CreateTicketWizard';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

function App() {
  const { isAuthenticated, isAdmin, isTechnician } = useAuth();
  const isCustomer = isAuthenticated && !isAdmin && !isTechnician;

  const {
    currentPath,
    navigate,
    isAdminRoute,
    isTechRoute,
    isTrackerRoute,
    isCustomerRoute,
  } = useRouter();

  // Active Tab within the shell
  const [activeTab, setActiveTab] = useState(() => {
    if (isAdmin) return 'tickets';
    if (isTechnician) return 'technician-bench';
    return 'customer-portal';
  });

  // Modals & Panels State
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null); // Opens slide-over drawer
  const [fullWorkspaceTicketId, setFullWorkspaceTicketId] = useState(null); // Opens 5-tab workspace modal
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false); // Opens Cmd+K command palette

  // Trigger ticket refresh when updated
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((n) => n + 1);

  // Synchronize internal tab when route or role changes
  useEffect(() => {
    if (isAdminRoute && isAdmin) {
      if (!['tickets', 'customers', 'devices', 'technicians', 'tracker'].includes(activeTab)) {
        setActiveTab('tickets');
      }
    } else if (isTechRoute && isTechnician) {
      if (!['technician-bench', 'available-pool', 'tickets', 'tracker'].includes(activeTab)) {
        setActiveTab('technician-bench');
      }
    } else if (isTrackerRoute) {
      setActiveTab('tracker');
    } else if (isCustomerRoute && isCustomer) {
      setActiveTab('customer-portal');
    }
  }, [isAdminRoute, isTechRoute, isTrackerRoute, isCustomerRoute, isAdmin, isTechnician, isCustomer]);

  // Handle open full workspace from drawer
  const handleOpenFullWorkspace = (ticket) => {
    setSelectedTicketId(null);
    setFullWorkspaceTicketId(ticket.id || ticket);
  };

  // Handle navigate to customer CRM from drawer or ticket list
  const handleNavigateToCustomer = (customerId) => {
    setSelectedTicketId(null);
    setFullWorkspaceTicketId(null);
    setActiveTab('customers');
  };

  // Handle navigate to hardware device inventory
  const handleNavigateToDevice = (deviceId) => {
    setSelectedTicketId(null);
    setFullWorkspaceTicketId(null);
    setActiveTab('devices');
  };

  // Reusable global modals & overlays rendered across views
  const renderGlobalOverlays = () => (
    <>
      {/* 5-Step Repair Ticket Intake Wizard */}
      <CreateTicketWizard
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onTicketCreated={() => {
          triggerRefresh();
          setActiveTab('tickets');
        }}
      />

      {/* Slide-over Ticket Inspection & Fast-Action Drawer */}
      <TicketDrawer
        ticketId={selectedTicketId}
        isOpen={Boolean(selectedTicketId)}
        onClose={() => setSelectedTicketId(null)}
        onOpenFullWorkspace={handleOpenFullWorkspace}
        onTicketUpdated={triggerRefresh}
        onNavigateToCustomer={handleNavigateToCustomer}
      />

      {/* Comprehensive 5-Tab Deep Repair Workspace Modal */}
      <TicketWorkspaceModal
        ticketId={fullWorkspaceTicketId}
        isOpen={Boolean(fullWorkspaceTicketId)}
        onClose={() => setFullWorkspaceTicketId(null)}
        onTicketUpdated={triggerRefresh}
      />

      {/* Global Command Palette & Multi-Entity Search (Cmd/Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectTicket={(ticket) => {
          setSelectedTicketId(ticket.id);
          setIsGlobalSearchOpen(false);
        }}
        onSelectCustomer={(customer) => {
          setActiveTab('customers');
          setIsGlobalSearchOpen(false);
        }}
        onSelectDevice={(device) => {
          setActiveTab('devices');
          setIsGlobalSearchOpen(false);
        }}
        onOpenCreateTicket={() => {
          setIsCreateTicketOpen(true);
          setIsGlobalSearchOpen(false);
        }}
        onOpenCreateCustomer={() => {
          setActiveTab('customers');
          setIsGlobalSearchOpen(false);
        }}
        onOpenCreateDevice={() => {
          setActiveTab('devices');
          setIsGlobalSearchOpen(false);
        }}
      />
    </>
  );

  // =========================================================================
  // ROUTE 1: ADMIN PORTAL (/admin, /admin/login, /admin-login)
  // =========================================================================
  if (isAdminRoute) {
    if (!isAuthenticated || !isAdmin) {
      return <AdminLoginPage onNavigate={navigate} />;
    }

    return (
      <AppLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
      >
        {activeTab === 'tickets' && (
          <TicketList
            key={refreshTrigger}
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
            onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
            onNavigateToCustomer={handleNavigateToCustomer}
            onNavigateToDevice={handleNavigateToDevice}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            onViewRepairs={() => setActiveTab('tickets')}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceManager
            onViewRepairs={() => setActiveTab('tickets')}
          />
        )}

        {activeTab === 'technicians' && <TechnicianManager />}

        {activeTab === 'tracker' && (
          <PublicTracker onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)} />
        )}

        {renderGlobalOverlays()}
      </AppLayout>
    );
  }

  // =========================================================================
  // ROUTE 2: TECHNICIAN / WORKER PORTAL (/technician, /worker, /technician-login)
  // =========================================================================
  if (isTechRoute) {
    if (!isAuthenticated || !isTechnician) {
      return <TechnicianLoginPage onNavigate={navigate} />;
    }

    return (
      <AppLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
      >
        {activeTab === 'technician-bench' && (
          <TechnicianWorkbench
            key={`bench-${refreshTrigger}`}
            initialQueueTab="my-bench"
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
            onTicketUpdated={triggerRefresh}
          />
        )}

        {activeTab === 'available-pool' && (
          <TechnicianWorkbench
            key={`pool-${refreshTrigger}`}
            initialQueueTab="available"
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
            onTicketUpdated={triggerRefresh}
          />
        )}

        {activeTab === 'tickets' && (
          <TicketList
            key={`tickets-${refreshTrigger}`}
            onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
            onOpenCreateTicket={() => setIsCreateTicketOpen(true)}
            onNavigateToCustomer={handleNavigateToCustomer}
            onNavigateToDevice={handleNavigateToDevice}
          />
        )}

        {activeTab === 'tracker' && (
          <PublicTracker onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)} />
        )}

        {renderGlobalOverlays()}
      </AppLayout>
    );
  }

  // =========================================================================
  // ROUTE 3: PUBLIC REPAIR TRACKER (/track, /tracker)
  // =========================================================================
  if (isTrackerRoute) {
    return (
      <AppLayout
        activeTab="tracker"
        setActiveTab={setActiveTab}
        onNavigate={navigate}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
      >
        <PublicTracker onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)} />

        {renderGlobalOverlays()}
      </AppLayout>
    );
  }

  // =========================================================================
  // ROUTE 4: CUSTOMER / ROOT PORTAL (/, /customer, /client, /login)
  // =========================================================================
  if (!isAuthenticated) {
    // Unauthenticated landing page -> Dedicated Customer Login & Registration Page!
    return <CustomerLoginPage onNavigate={navigate} />;
  }

  if (isAdmin) {
    // If logged-in admin lands on root, redirect to admin desk
    navigate('/admin');
    return null;
  }

  if (isTechnician) {
    // If logged-in technician lands on root, redirect to technician bench
    navigate('/technician');
    return null;
  }

  // Authenticated Customer -> Customer Service Portal
  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onNavigate={navigate}
      onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
    >
      <CustomerPortal
        key={refreshTrigger}
        onSelectTicket={(ticket) => setSelectedTicketId(ticket.id)}
      />

      {renderGlobalOverlays()}
    </AppLayout>
  );
}

export default App;
