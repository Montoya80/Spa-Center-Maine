
import React from 'react';
import { Appointment, Employee, BusinessConfig, Product, Patient } from '../types';
import { 
    CalendarDays, 
    Clock, 
    CheckCircle2, 
    Plus, 
    UserPlus, 
    Fingerprint, 
    Users, 
    MapPin, 
    AlertTriangle, 
    ShoppingBag, 
    Beaker, 
    Package, 
    Bell, 
    Calendar, 
    DollarSign, 
    ChevronRight, 
    Activity, 
    Stethoscope,
    Sparkles,
    MessageCircle,
    Send,
    User,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import { generateWhatsAppLink, getQuickMessage } from '../services/notificationService';

interface DashboardProps {
  appointments: Appointment[];
  employees?: Employee[];
  patients?: Patient[];
  products?: Product[];
  currentUser?: Employee;
  businessConfig?: BusinessConfig;
  onNewAppointment: () => void;
  onNewPatient: () => void;
  showFinance: boolean; 
  onClockIn?: (empId: string) => void;
  onClockOut?: (empId: string) => void;
}

const StatCard = ({ title, value, sub, icon: Icon, color, textColor }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      <Icon size={28} />
    </div>
    <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <h3 className={`text-3xl font-black ${textColor}`}>{value}</h3>
        <p className="text-slate-400 text-[10px] mt-0.5">{sub}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ 
    appointments, 
    employees = [],
    patients = [],
    products = [],
    currentUser,
    businessConfig,
    onNewAppointment, 
    onNewPatient, 
    showFinance,
    onClockIn,
    onClockOut
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  // --- REAL TIME DATA CALCULATION ---
  const pendingRequests = appointments.filter(a => a.status === 'pending').sort((a,b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const newPatientsToday = patients.filter(p => p.registrationDate === today);
  const salesToday = todayAppointments.filter(apt => products?.some(p => p.name === apt.service && p.categoryType === 'retail'));
  const treatmentsToday = todayAppointments.filter(apt => !products?.some(p => p.name === apt.service && p.categoryType === 'retail'));
  const userTodayLog = currentUser?.attendanceLog.find(l => l.date === today);
  const isClockedIn = !!userTodayLog?.checkIn && !userTodayLog?.checkOut;
  const isClockedOut = !!userTodayLog?.checkOut;
  const currentDayOfWeek = new Date().getDay();
  const activeStaff = employees.filter(e => e.workSchedule?.find(s => s.dayOfWeek === currentDayOfWeek && s.active));
  
  // Inventory Alerts
  const lowStockThreshold = 5;
  const criticalStockItems = products?.filter(p => p.stock <= 2 && p.active) || [];
  const lowStockItems = products?.filter(p => p.stock > 2 && p.stock <= lowStockThreshold && p.active) || [];
  const allAlertItems = [...criticalStockItems, ...lowStockItems];

  // --- MESSAGING STATE ---
  const [msgTarget, setMsgTarget] = React.useState<'client' | 'employee'>('client');
  const [msgRecipientId, setMsgRecipientId] = React.useState('');
  const [msgCustomText, setMsgCustomText] = React.useState('');

  const handleSendWhatsApp = () => {
      let recipientPhone = '';
      let recipientName = '';

      if (msgTarget === 'client') {
          const client = patients.find(p => p.id === msgRecipientId);
          if (client) {
              recipientPhone = client.phone;
              recipientName = client.fullName;
          }
      } else {
          const emp = employees.find(e => e.id === msgRecipientId);
          if (emp) {
              recipientPhone = emp.phone;
              recipientName = emp.fullName;
          }
      }

      if (!recipientPhone) {
          alert('Por favor selecciona un destinatario válido.');
          return;
      }

      const message = msgCustomText || getQuickMessage(msgTarget === 'client' ? 'general' : 'staff', recipientName);
      window.open(generateWhatsAppLink(recipientPhone, message), '_blank');
      setMsgCustomText(''); 
  };

  const applyTemplate = (type: 'reminder' | 'promo' | 'general' | 'staff') => {
      let recipientName = 'Cliente';
      if (msgTarget === 'client') {
          const client = patients.find(p => p.id === msgRecipientId);
          if (client) recipientName = client.fullName;
      } else {
          const emp = employees.find(e => e.id === msgRecipientId);
          if (emp) recipientName = emp.fullName;
      }
      setMsgCustomText(getQuickMessage(type, recipientName));
  };

  const timelineEvents = [
      ...appointments.map(apt => {
          const isSale = products?.some(p => p.name === apt.service && p.categoryType === 'retail');
          return {
              id: apt.id, type: isSale ? 'sale' : 'appointment', title: isSale ? 'Venta de Producto' : 'Cita de Tratamiento',
              name: apt.service, person: apt.patientName, time: apt.time, date: apt.date, status: apt.status,
              rawDate: new Date(`${apt.date}T${apt.time}`), price: apt.price, isPending: apt.status === 'pending'
          };
      }),
      ...patients.map(p => ({
          id: p.id, type: 'new_patient', title: 'Nuevo Cliente', name: 'Registro en sistema', person: p.fullName,
          time: 'Reciente', date: p.registrationDate || today, status: 'confirmed', rawDate: new Date(`${p.registrationDate || today}T00:00:00`),
          price: 0, isPending: false
      }))
  ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

  const displayTimeline = timelineEvents.length > 0 ? timelineEvents.slice(0, 10) : [];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* 🚨 SECTION 1: ACTION REQUIRED */}
      {pendingRequests.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-8 border-amber-500 rounded-r-2xl p-6 shadow-xl animate-slide-down relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-10">
                  <Bell size={120} className="text-amber-600" />
              </div>
              <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black text-amber-900 flex items-center gap-3">
                          <span className="relative flex h-5 w-5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-5 w-5 bg-amber-600"></span></span>
                          ATENCIÓN REQUERIDA ({pendingRequests.length})
                      </h2>
                      <button onClick={onNewAppointment} className="bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-amber-700 transition-colors">
                          Gestionar Todo
                      </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingRequests.map(req => {
                          const isProduct = products?.some(p => p.name === req.service);
                          return (
                              <div key={req.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-md flex flex-col gap-2 hover:scale-[1.02] transition-transform">
                                  <div className="flex justify-between items-start">
                                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isProduct ? 'bg-purple-600 text-white' : 'bg-teal-600 text-white'}`}>{isProduct ? '🛍️ NUEVA VENTA' : '📅 NUEVA CITA'}</span>
                                      <span className="text-xs font-mono font-bold text-slate-500">{req.time} hrs</span>
                                  </div>
                                  <div><h4 className="font-bold text-slate-900 text-lg">{req.patientName}</h4><p className="text-sm text-slate-600 font-medium truncate">{req.service}</p></div>
                                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                                      <span className="font-black text-slate-800 text-lg">${req.price}</span>
                                      <span className="text-xs text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full animate-pulse"><AlertTriangle size={12} /> CONFIRMAR</span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* 📊 SECTION 2: TODAY'S OVERVIEW */}
      <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="text-slate-400" /> Resumen de Hoy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Citas Tratamiento" value={treatmentsToday.length} sub="Sesiones agendadas" icon={Stethoscope} color="bg-teal-500" textColor="text-teal-900"/>
            <StatCard title="Venta Productos" value={salesToday.length} sub="Transacciones retail" icon={ShoppingBag} color="bg-purple-500" textColor="text-purple-900"/>
            <StatCard title="Clientes Nuevos" value={newPatientsToday.length} sub="Registrados hoy" icon={UserPlus} color="bg-blue-500" textColor="text-blue-900"/>
            {showFinance && <StatCard title="Ingreso Estimado" value={`$${todayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0).toLocaleString()}`} sub="Total del día" icon={DollarSign} color="bg-emerald-500" textColor="text-emerald-900"/>}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 📜 SECTION 3: LIVE ACTIVITY FEED */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Sparkles className="text-yellow-500" fill="currentColor" /> Bitácora en Tiempo Real</h3>
                  <span className="text-xs font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{displayTimeline.length} Eventos</span>
              </div>
              <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-200">
                  {displayTimeline.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400"><Clock size={48} className="mb-4 opacity-20" /><p>Sin actividad reciente.</p></div>
                  ) : (
                      <div className="divide-y divide-slate-50">
                          {displayTimeline.map((evt, idx) => (
                              <div key={`${evt.type}-${evt.id}-${idx}`} className="p-5 hover:bg-slate-50 transition-colors flex gap-4 group">
                                  <div className="flex flex-col items-center gap-2">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm text-white font-bold ${evt.type === 'new_patient' ? 'bg-blue-500' : evt.type === 'sale' ? 'bg-purple-500' : 'bg-teal-500'}`}>
                                          {evt.type === 'new_patient' && <UserPlus size={20} />}
                                          {evt.type === 'sale' && <ShoppingBag size={20} />}
                                          {evt.type === 'appointment' && <CalendarDays size={20} />}
                                      </div>
                                      <div className={`h-full w-0.5 ${idx === displayTimeline.length - 1 ? 'bg-transparent' : 'bg-slate-100'}`}></div>
                                  </div>
                                  <div className="flex-1 pt-1">
                                      <div className="flex justify-between items-start">
                                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block ${evt.type === 'new_patient' ? 'bg-blue-50 text-blue-700' : evt.type === 'sale' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>{evt.title}</span>
                                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{evt.date === today ? 'HOY' : evt.date} • {evt.time}</span>
                                      </div>
                                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{evt.person}</h4>
                                      <p className="text-sm text-slate-600 mb-2 font-medium">{evt.name}</p>
                                      <div className="flex items-center gap-2 mt-2">
                                          {evt.price > 0 && <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">${evt.price}</span>}
                                          {evt.isPending && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1 border border-amber-100"><AlertTriangle size={10} /> Pendiente</span>}
                                          {!evt.isPending && evt.type !== 'new_patient' && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1 border border-green-100"><CheckCircle2 size={10} /> Confirmado</span>}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>

          {/* 📦 SECTION 4: SIDEBAR */}
          <div className="space-y-8">
              
              {/* --- INVENTORY / WAREHOUSE ALERT WIDGET (REDESIGNED) --- */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <BarChart3 size={120} />
                  </div>
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                              <Package className="text-primary-500" /> Almacén Crítico
                          </h3>
                          <button className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary-600 transition-colors">
                              <ArrowUpRight size={18} />
                          </button>
                      </div>

                      {allAlertItems.length === 0 ? (
                          <div className="py-6 text-center bg-green-50 rounded-[2rem] border border-green-100 border-dashed">
                              <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
                              <p className="text-xs font-black text-green-700 uppercase tracking-tighter">Stock Saludable</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {allAlertItems.slice(0, 5).map(item => {
                                  const isCritical = item.stock <= 2;
                                  return (
                                      <div key={item.id} className="space-y-1.5">
                                          <div className="flex justify-between items-end">
                                              <span className="text-xs font-bold text-slate-700 truncate w-3/4">{item.name}</span>
                                              <span className={`text-[10px] font-black ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>{item.stock} UNID.</span>
                                          </div>
                                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                              <div 
                                                  className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} 
                                                  style={{ width: `${Math.min(100, (item.stock / 15) * 100)}%` }}
                                              ></div>
                                          </div>
                                      </div>
                                  );
                              })}
                              
                              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Alertas: {allAlertItems.length}</p>
                                  <span className="text-[10px] font-black text-primary-600 underline cursor-pointer">Ver Todo</span>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Messaging Center */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500 rounded-full opacity-20 blur-xl"></div>
                  <div className="relative z-10">
                      <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                          <MessageCircle className="text-green-400" /> WhatsApp
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="flex p-1 bg-slate-800 rounded-2xl">
                              <button onClick={() => { setMsgTarget('client'); setMsgRecipientId(''); }} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${msgTarget === 'client' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Clientes</button>
                              <button onClick={() => { setMsgTarget('employee'); setMsgRecipientId(''); }} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${msgTarget === 'employee' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Equipo</button>
                          </div>

                          <select 
                              value={msgRecipientId} 
                              onChange={(e) => setMsgRecipientId(e.target.value)}
                              className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-xs font-bold text-white focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                          >
                              <option value="">Seleccionar destinatario...</option>
                              {msgTarget === 'client' 
                                  ? patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)
                                  : employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)
                              }
                          </select>

                          <textarea 
                              value={msgCustomText}
                              onChange={(e) => setMsgCustomText(e.target.value)}
                              className="w-full bg-slate-800 border-none rounded-xl p-4 text-xs text-white focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none placeholder:text-slate-600 font-medium"
                              placeholder="Escribe el mensaje..."
                          />

                          <button 
                              onClick={handleSendWhatsApp}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-green-900/50 flex items-center justify-center gap-2"
                          >
                              <Send size={16} /> Enviar WhatsApp
                          </button>
                      </div>
                  </div>
              </div>

              {/* Staff Clock */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg relative overflow-hidden">
                   <div className="relative z-10">
                       <div className="flex items-center justify-between mb-8">
                           <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 text-slate-900"><Fingerprint className="text-primary-500"/> Asistencia</h3>
                           <p className="text-xl font-black text-slate-900 font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                       
                       {isClockedOut ? (
                           <div className="text-center p-6 bg-slate-50 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-[10px]">Turno Finalizado</div>
                       ) : isClockedIn ? (
                           <button onClick={() => currentUser && onClockOut && onClockOut(currentUser.id)} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-red-100">
                               Registrar Salida
                           </button>
                       ) : (
                           <button onClick={() => currentUser && onClockIn && onClockIn(currentUser.id)} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-100">
                               Registrar Entrada
                           </button>
                       )}
                   </div>
              </div>

          </div>
      </div>
    </div>
  );
};

export default Dashboard;
