
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';
import AppointmentManager from './components/AppointmentManager';
import InventoryManager from './components/InventoryManager';
import ClientBooking from './components/ClientBooking';
import ClientPortal from './components/ClientPortal';
import AdminSettings from './components/AdminSettings';
import EmployeeManager from './components/EmployeeManager';
import Login from './components/Login';
import FrontPage from './components/FrontPage';
import { ViewState, Patient, Appointment, UserRole, Service, Promotion, BusinessConfig, Employee, Product, InventoryTransaction, ClinicalNote } from './types';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS, INITIAL_SERVICES, INITIAL_PROMOS, INITIAL_CONFIG, MOCK_EMPLOYEES, INITIAL_PRODUCTS } from './constants';
import { syncPatientToCloud, syncAppointmentToCloud, syncProductToCloud } from './services/supabaseService';

type ActionIntent = 'new_patient' | 'new_appointment' | null;

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);
  const [loginTab, setLoginTab] = useState<'client' | 'employee'>('client');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('client'); 
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Data State
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(INITIAL_CONFIG);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [actionIntent, setActionIntent] = useState<ActionIntent>(null);

  // Helper para Sync
  const canSync = () => businessConfig.supabaseConfig?.enabled && businessConfig.supabaseConfig.url;

  // -- Navigation Handlers --
  const handleLandingLogin = (type: 'client' | 'employee') => { setLoginTab(type); setShowLanding(false); };
  const handleLandingBooking = () => { setLoginTab('client'); setShowLanding(false); };
  const handleBackToLanding = () => { setShowLanding(true); setIsAuthenticated(false); };

  const handleLoginSuccess = (user: Employee | Patient, role: 'admin' | 'client') => {
      if (role === 'admin') {
          setCurrentUser(user as Employee);
          setUserRole('admin');
          setCurrentView(ViewState.DASHBOARD);
      } else {
          setSelectedPatient(user as Patient);
          setUserRole('client');
          setCurrentView(ViewState.CLIENT_PORTAL);
          setCurrentUser(null); 
      }
      setIsAuthenticated(true);
      setShowLanding(false);
  };

  const handleLoginAsPatient = (patient: Patient) => {
      setSelectedPatient(patient);
      setUserRole('client');
      setCurrentView(ViewState.CLIENT_PORTAL);
      setCurrentUser(null); 
      setIsAuthenticated(true);
      setShowLanding(false);
  };

  const handleGuestBooking = () => {
      setUserRole('client');
      setIsAuthenticated(true);
      setCurrentView(ViewState.CLIENT_BOOKING);
      setCurrentUser(null);
      setSelectedPatient(null);
      setShowLanding(false);
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setSelectedPatient(null);
      setUserRole('client');
      setActionIntent(null);
      setShowLanding(true); 
  };

  const hasPermission = (perm: string) => {
      if (userRole === 'client' || !currentUser) return false;
      return currentUser.permissions.includes('all') || currentUser.permissions.includes(perm as any);
  };

  const toggleRole = () => handleLogout();

  const handleNavigate = (view: ViewState) => {
    if (view === ViewState.SETTINGS && !hasPermission('manage_settings')) return;
    if (view === ViewState.EMPLOYEES && !hasPermission('manage_employees')) return;
    if (view === ViewState.INVENTORY && !hasPermission('manage_inventory')) return;
    setCurrentView(view);
    if (view !== ViewState.PATIENT_DETAIL && view !== ViewState.CLIENT_PORTAL) setSelectedPatient(null);
    setActionIntent(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentView(ViewState.PATIENT_DETAIL);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) setSelectedPatient(updatedPatient);
    // Cloud Sync
    if (canSync()) syncPatientToCloud(businessConfig.supabaseConfig!, updatedPatient);
  };

  const handleAddPatient = (newPatient: Patient) => {
      setPatients(prev => [newPatient, ...prev]);
      // Cloud Sync
      if (canSync()) syncPatientToCloud(businessConfig.supabaseConfig!, newPatient);
  };
  
  const handleDeletePatient = (id: string) => {
      if (!hasPermission('edit_patients')) return;
      if (confirm('¿Eliminar cliente?')) {
          setPatients(prev => prev.filter(p => p.id !== id));
          setAppointments(prev => prev.filter(a => a.patientId !== id)); 
          setSelectedPatient(null);
          setCurrentView(ViewState.PATIENTS);
      }
  };

  const handleAddAppointment = (newAppointment: Appointment) => {
      setAppointments(prev => [newAppointment, ...prev]);
      // Cloud Sync
      if (canSync()) syncAppointmentToCloud(businessConfig.supabaseConfig!, newAppointment);
  };

  const handleUpdateAppointment = (updatedApt: Appointment) => {
      setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));
      // Cloud Sync
      if (canSync()) syncAppointmentToCloud(businessConfig.supabaseConfig!, updatedApt);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
      setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      // Cloud Sync
      if (canSync()) syncProductToCloud(businessConfig.supabaseConfig!, updatedProd);
  };

  const handleAddProduct = (newProd: Product) => {
      setProducts(prev => [newProd, ...prev]);
      // Cloud Sync
      if (canSync()) syncProductToCloud(businessConfig.supabaseConfig!, newProd);
  };

  const handleAddInventoryTransaction = (tr: InventoryTransaction) => setInventoryTransactions(prev => [tr, ...prev]);

  const handleConsumeStockFromNote = (note: ClinicalNote) => {
      if (!note.materialsUsed || note.materialsUsed.length === 0) return;
      const updatedProducts = [...products];
      note.materialsUsed.forEach(material => {
          const prodIdx = updatedProducts.findIndex(p => p.id === material.productId);
          if (prodIdx !== -1) {
              const updatedItem = { ...updatedProducts[prodIdx], stock: Math.max(0, updatedProducts[prodIdx].stock - material.quantity) };
              updatedProducts[prodIdx] = updatedItem;
              // Cloud Sync individual item
              if (canSync()) syncProductToCloud(businessConfig.supabaseConfig!, updatedItem);
          }
      });
      setProducts(updatedProducts);
  };

  const handleClientBooking = (newAppointment: Appointment, newPatient: Patient) => {
    const existingPatient = patients.find(p => p.email.toLowerCase() === newPatient.email.toLowerCase());
    if (existingPatient) {
        newAppointment.patientId = existingPatient.id;
        newAppointment.patientName = existingPatient.fullName;
    } else {
        setPatients(prev => [newPatient, ...prev]);
        if (canSync()) syncPatientToCloud(businessConfig.supabaseConfig!, newPatient);
    }
    setAppointments(prev => [newAppointment, ...prev]);
    if (canSync()) syncAppointmentToCloud(businessConfig.supabaseConfig!, newAppointment);
  };

  const handleClientLoginFromBooking = (patient: Patient) => { setSelectedPatient(patient); setCurrentView(ViewState.CLIENT_PORTAL); };
  const handleClientCancelAppointment = (aptId: string) => {
      const updated = appointments.map(a => a.id === aptId ? { ...a, status: 'cancelled' as const } : a);
      setAppointments(updated);
      const cancelledApt = updated.find(x => x.id === aptId);
      if (cancelledApt && canSync()) syncAppointmentToCloud(businessConfig.supabaseConfig!, cancelledApt);
  };

  const handleAddEmployee = (emp: Employee) => setEmployees(prev => [...prev, emp]);
  const handleUpdateEmployee = (emp: Employee) => setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
  const handleDeleteEmployee = (id: string) => setEmployees(prev => prev.filter(e => e.id !== id));

  const handleClockIn = (empId: string) => {
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, attendanceLog: [...emp.attendanceLog, { date: dateStr, checkIn: timeStr, status: 'present' }] } : emp));
  };

  const handleClockOut = (empId: string) => {
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setEmployees(prev => prev.map(emp => emp.id === empId ? { ...emp, attendanceLog: emp.attendanceLog.map(l => l.date === dateStr && !l.checkOut ? { ...l, checkOut: timeStr } : l) } : emp));
  };

  const renderContent = () => {
    if (userRole === 'client') {
        if (currentView === ViewState.CLIENT_PORTAL && selectedPatient) {
            return ( <ClientPortal patient={selectedPatient} appointments={appointments} businessConfig={businessConfig} onLogout={handleLogout} onNewAppointment={() => setCurrentView(ViewState.CLIENT_BOOKING)} onCancelAppointment={handleClientCancelAppointment} onUpdateProfile={handleUpdatePatient} /> );
        }
        return ( <ClientBooking existingAppointments={appointments} allPatients={patients} services={services} promotions={promotions} products={products} businessConfig={businessConfig} onBookAppointment={handleClientBooking} onClientLogin={handleClientLoginFromBooking} currentUser={selectedPatient} onBack={selectedPatient ? () => setCurrentView(ViewState.CLIENT_PORTAL) : undefined} /> );
    }

    if (!currentUser) return null;

    switch (currentView) {
      case ViewState.DASHBOARD:
        return ( <Dashboard appointments={appointments} employees={employees} patients={patients} products={products} currentUser={currentUser} businessConfig={businessConfig} onNewAppointment={() => setCurrentView(ViewState.APPOINTMENTS)} onNewPatient={() => setActionIntent('new_patient')} showFinance={hasPermission('view_finance')} onClockIn={handleClockIn} onClockOut={handleClockOut} /> );
      case ViewState.APPOINTMENTS:
        return ( <AppointmentManager appointments={appointments} patients={patients} employees={employees} services={services} promotions={promotions} products={products} businessConfig={businessConfig} onAddAppointment={handleAddAppointment} onUpdateAppointment={handleUpdateAppointment} onViewPatient={handleSelectPatient} canEdit={hasPermission('edit_appointments')} currentUser={currentUser} /> );
      case ViewState.PATIENTS:
        return ( <PatientList patients={patients} onSelectPatient={handleSelectPatient} onAddPatient={handleAddPatient} onDeletePatient={handleDeletePatient} onUpdatePatient={handleUpdatePatient} onLoginAsPatient={handleLoginAsPatient} startOpen={actionIntent === 'new_patient'} onOpenChange={(isOpen) => !isOpen && setActionIntent(null)} currentUser={currentUser} canDelete={hasPermission('edit_patients')} /> );
      case ViewState.PATIENT_DETAIL:
        if (!selectedPatient) return null;
        return ( <PatientDetail patient={selectedPatient} employees={employees} products={products} currentUser={currentUser} onBack={() => handleNavigate(ViewState.PATIENTS)} onUpdatePatient={handleUpdatePatient} onDeletePatient={handleDeletePatient} onConsumeStock={handleConsumeStockFromNote} /> );
      case ViewState.INVENTORY:
        return ( <InventoryManager products={products} transactions={inventoryTransactions} employees={employees} patients={patients} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} onAddTransaction={handleAddInventoryTransaction} /> );
      case ViewState.EMPLOYEES:
        return ( <EmployeeManager employees={employees} onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} onSwitchUser={(emp) => { setCurrentUser(emp); setCurrentView(ViewState.DASHBOARD); }} /> );
      case ViewState.SETTINGS:
        return ( <AdminSettings services={services} promotions={promotions} products={products} businessConfig={businessConfig} patients={patients} appointments={appointments} employees={employees} onUpdateServices={setServices} onUpdatePromotions={setPromotions} onUpdateProducts={setProducts} onUpdateConfig={setBusinessConfig} /> );
      default: return null;
    }
  };

  if (showLanding && !isAuthenticated) return ( <FrontPage services={services} promotions={promotions} businessConfig={businessConfig} onNavigateLogin={handleLandingLogin} onNavigateBooking={handleLandingBooking} /> );
  if (!isAuthenticated) return ( <Login employees={employees} patients={patients} onLoginSuccess={handleLoginSuccess} onGuestBooking={handleGuestBooking} initialTab={loginTab} onBackToHome={handleBackToLanding} /> );

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} userRole={userRole} onToggleRole={toggleRole} currentUser={currentUser || MOCK_EMPLOYEES[0]} allEmployees={employees} onSwitchUser={setCurrentUser}>
      {renderContent()}
    </Layout>
  );
};

export default App;
