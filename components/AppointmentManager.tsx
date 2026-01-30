
import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Employee, BusinessConfig, Service, Promotion, Product } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus, 
  X, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Mail, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Briefcase, 
  CreditCard, 
  UserCheck, 
  Search,
  Filter,
  UserPlus,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { generateWhatsAppLink, generateMailtoLink, getPaymentInfoMessage } from '../services/notificationService';
import { INITIAL_SERVICES } from '../constants'; 

interface AppointmentManagerProps {
  appointments: Appointment[];
  patients?: Patient[];
  employees?: Employee[]; 
  businessConfig?: BusinessConfig; 
  services?: Service[]; 
  promotions?: Promotion[];
  products?: Product[];
  onAddAppointment: (appointment: Appointment) => void;
  onViewPatient?: (patient: Patient) => void; // New prop for navigation
  startOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onRequestNewPatient?: () => void;
  canEdit: boolean; 
  onUpdateAppointment?: (appointment: Appointment) => void; 
  currentUser?: Employee; 
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ 
  appointments: initialAppointments, 
  patients = [], 
  employees = [],
  businessConfig,
  services = INITIAL_SERVICES,
  promotions = [],
  products = [],
  onAddAppointment,
  onViewPatient,
  startOpen = false,
  onOpenChange,
  onRequestNewPatient,
  canEdit,
  onUpdateAppointment,
  currentUser
}) => {
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(initialAppointments);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialist, setFilterSpecialist] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  
  // Payment Modal State
  const [paymentModalData, setPaymentModalData] = useState<{
      isOpen: boolean;
      appointment: Appointment | null;
      patient: Patient | null;
  }>({ isOpen: false, appointment: null, patient: null });

  useEffect(() => { setLocalAppointments(initialAppointments); }, [initialAppointments]);
  useEffect(() => { if (startOpen && canEdit) setShowModal(true); }, [startOpen, canEdit]);

  const handleModalClose = () => { setShowModal(false); if (onOpenChange) onOpenChange(false); };
  
  // New Appointment State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [price, setPrice] = useState('');

  const findItemPrice = (name: string) => {
      const srv = services.find(s => s.name === name);
      if (srv) return srv.price;
      const prod = products.find(p => p.name === name);
      if (prod) return prod.price;
      const promo = promotions.find(p => p.title === name);
      if (promo) return promo.price || 0;
      return 0;
  };

  const handleReassign = (aptId: string, empId: string) => {
      const updatedList = localAppointments.map(a => a.id === aptId ? { ...a, assignedTo: empId } : a);
      setLocalAppointments(updatedList);
      const updatedApt = updatedList.find(a => a.id === aptId);
      if (updatedApt && onUpdateAppointment) onUpdateAppointment(updatedApt);
  };

  const handleStatusChange = (aptId: string, newStatus: Appointment['status']) => {
      const updatedList = localAppointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a);
      setLocalAppointments(updatedList);
      const updatedApt = updatedList.find(a => a.id === aptId);
      if (updatedApt && onUpdateAppointment) onUpdateAppointment(updatedApt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const patient = patients.find(p => p.id === selectedPatientId);
    
    if (patient) {
        const newApt: Appointment = {
            id: `apt${Date.now()}`,
            patientId: patient.id,
            patientName: patient.fullName,
            date,
            time,
            service,
            price: price ? parseFloat(price) : findItemPrice(service),
            status: 'confirmed',
            assignedTo: assignedTo || undefined,
            paymentVerified: false
        };
        onAddAppointment(newApt);
        handleModalClose();
    }
  };

  const filteredAppointments = localAppointments
    .filter(a => 
      (a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.service.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterSpecialist === 'all' || a.assignedTo === filterSpecialist) &&
      (filterStatus === 'all' || a.status === filterStatus)
    )
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const getSpecialistName = (id?: string) => {
    if (!id) return 'Sin asignar';
    return employees.find(e => e.id === id)?.fullName || 'Desconocido';
  };

  const getSpecialistAvatar = (id?: string) => {
    if (!id) return null;
    return employees.find(e => e.id === id)?.avatarUrl;
  };

  const handleGoToPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient && onViewPatient) {
      onViewPatient(patient);
    }
  };

  const inputClass = "w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-400 outline-none bg-white text-sm";

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-primary-600" /> Control Clínico Total
          </h2>
          <p className="text-slate-500 text-sm">Gestión de expedientes diarios y asignación de especialistas.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
                onClick={() => setViewMode('cards')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <LayoutGrid size={20} />
            </button>
            <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <List size={20} />
            </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
          
          <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                className="bg-slate-50 border-transparent rounded-xl text-sm p-2 w-full outline-none focus:ring-2 focus:ring-primary-200"
                value={filterSpecialist}
                onChange={e => setFilterSpecialist(e.target.value)}
              >
                  <option value="all">Todos los Especialistas</option>
                  {employees.map(e => <option value={e.id} key={e.id}>{e.fullName}</option>)}
              </select>
          </div>

          <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-slate-400" />
              <select 
                className="bg-slate-50 border-transparent rounded-xl text-sm p-2 w-full outline-none focus:ring-2 focus:ring-primary-200"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                  <option value="all">Todos los Estados</option>
                  <option value="confirmed">Confirmados</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
              </select>
          </div>

          <button 
            onClick={() => setShowModal(true)} 
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Plus size={18} /> Agendar Nueva
          </button>
      </div>

      {/* Main View Area */}
      {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map(apt => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const isPending = apt.status === 'pending';
                  const isCompleted = apt.status === 'completed';
                  
                  return (
                      <div key={apt.id} className={`bg-white rounded-3xl border ${isPending ? 'border-amber-200 shadow-amber-50' : 'border-slate-100 shadow-slate-200'} shadow-lg overflow-hidden flex flex-col group hover:scale-[1.01] transition-all`}>
                          {/* Header of Card */}
                          <div className={`p-4 flex justify-between items-start ${isPending ? 'bg-amber-50/50' : isCompleted ? 'bg-green-50/50' : 'bg-slate-50/50'}`}>
                              <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                      <img src={patient?.avatarUrl || 'https://ui-avatars.com/api/?name=P'} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-slate-900 line-clamp-1">{apt.patientName}</h3>
                                      <span className="text-[10px] font-black text-primary-600 bg-white px-2 py-0.5 rounded border border-primary-100 uppercase tracking-tighter">EXP: {patient?.clientCode}</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-black text-slate-900 flex items-center gap-1 justify-end"><Clock size={12}/> {apt.time}</div>
                                  <div className="text-[10px] font-bold text-slate-400">{apt.date}</div>
                              </div>
                          </div>

                          {/* Body of Card */}
                          <div className="p-5 flex-1 space-y-4">
                              <div>
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tratamiento / Producto</label>
                                  <div className="flex justify-between items-center">
                                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{apt.service}</p>
                                      <span className="text-sm font-black text-slate-900">${apt.price}</span>
                                  </div>
                              </div>

                              {/* Specialist Assignment Section */}
                              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                      <Briefcase size={10} /> Especialista Asignado
                                  </label>
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                                          {apt.assignedTo ? (
                                              <img src={getSpecialistAvatar(apt.assignedTo) || ''} className="w-full h-full object-cover" />
                                          ) : (
                                              <User size={14} className="text-slate-300" />
                                          )}
                                      </div>
                                      <select 
                                          className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none p-0 flex-1 cursor-pointer"
                                          value={apt.assignedTo || ''}
                                          onChange={(e) => handleReassign(apt.id, e.target.value)}
                                      >
                                          <option value="">-- Sin Asignar --</option>
                                          {employees.map(e => <option value={e.id} key={e.id}>{e.fullName}</option>)}
                                      </select>
                                  </div>
                              </div>
                          </div>

                          {/* Footer / Actions */}
                          <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                              <div className="flex gap-2">
                                  <button 
                                      onClick={() => handleStatusChange(apt.id, 'completed')}
                                      className={`p-2 rounded-xl transition-colors ${isCompleted ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-green-600 border border-slate-100'}`}
                                      title="Completar"
                                  >
                                      <CheckCircle size={18} />
                                  </button>
                                  <button 
                                      onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                      className="p-2 rounded-xl bg-white text-slate-400 hover:text-red-600 border border-slate-100 transition-colors"
                                      title="Cancelar"
                                  >
                                      <XCircle size={18} />
                                  </button>
                              </div>
                              
                              <div className="flex gap-2">
                                  <button 
                                      onClick={() => {
                                          const patient = patients.find(p => p.id === apt.patientId);
                                          if (patient) window.open(generateWhatsAppLink(patient.phone, ''), '_blank');
                                      }}
                                      className="p-2 text-slate-400 hover:text-primary-600 bg-white border border-slate-100 rounded-xl transition-colors"
                                  >
                                      <MessageCircle size={18} />
                                  </button>
                                  <button 
                                      onClick={() => handleGoToPatient(apt.patientId)}
                                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                                  >
                                      Ver Ficha
                                  </button>
                              </div>
                          </div>
                      </div>
                  );
              })}

              {filteredAppointments.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                      <p className="text-slate-400 font-medium">No hay registros que coincidan con los filtros.</p>
                  </div>
              )}
          </div>
      ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                          <th className="p-4">Paciente</th>
                          <th className="p-4">Servicio</th>
                          <th className="p-4">Especialista</th>
                          <th className="p-4">Fecha/Hora</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {filteredAppointments.map(apt => (
                          <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                  <div className="font-bold text-slate-800">{apt.patientName}</div>
                              </td>
                              <td className="p-4 text-sm text-slate-600">{apt.service}</td>
                              <td className="p-4">
                                  <select 
                                      className="text-xs bg-slate-100 border-none rounded-lg px-2 py-1 outline-none font-bold"
                                      value={apt.assignedTo || ''}
                                      onChange={(e) => handleReassign(apt.id, e.target.value)}
                                  >
                                      <option value="">Sin Asignar</option>
                                      {employees.map(e => <option value={e.id} key={e.id}>{e.fullName}</option>)}
                                  </select>
                              </td>
                              <td className="p-4 text-sm font-mono">{apt.date} • {apt.time}</td>
                              <td className="p-4">
                                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {apt.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button 
                                          onClick={() => handleGoToPatient(apt.patientId)}
                                          className="p-2 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"
                                          title="Ver Expediente"
                                      >
                                          <ChevronRight size={18} />
                                      </button>
                                      <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={18} /></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
          </div>
      )}

      {/* Modal Nueva Cita */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-down">
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20}/> Nuevo Control de Cita</h3>
                    <button onClick={handleModalClose} className="hover:bg-slate-700 p-1 rounded-full"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">Paciente</label>
                        <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className={inputClass}>
                            <option value="">Seleccionar Paciente...</option>
                            {patients.map(p => <option value={p.id} key={p.id}>{p.fullName} ({p.clientCode})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">Especialista a Cargo</label>
                        <select required value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
                            <option value="">Asignar Especialista...</option>
                            {employees.map(e => <option value={e.id} key={e.id}>{e.fullName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">Servicio o Tratamiento</label>
                        <select required value={service} onChange={(e) => { const val = e.target.value; setService(val); setPrice(findItemPrice(val).toString()); }} className={inputClass}>
                            <option value="">Seleccionar...</option>
                            <optgroup label="Servicios">
                                {services.filter(s => s.active).map(s => <option value={s.name} key={s.id}>{s.name}</option>)}
                            </optgroup>
                            <optgroup label="Promociones">
                                {promotions.filter(p => p.active).map(p => <option value={p.title} key={p.id}>{p.title}</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Fecha</label>
                            <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Hora</label>
                            <input required type="time" value={time} onChange={e => setTime(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-primary-600 text-white font-black rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all mt-4">
                        CREAR EXPEDIENTE DE CITA
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
