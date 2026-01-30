
import React, { useState } from 'react';
import { Patient, Appointment, BusinessConfig, FileDocument } from '../types';
import { Calendar, Clock, LogOut, Plus, FileText, CheckCircle2, Image as ImageIcon, XCircle, AlertCircle, MapPin, Phone, MessageCircle, Mail, CreditCard, Copy, User, Shield, Upload, Eye, Trash2 } from 'lucide-react';

interface ClientPortalProps {
  patient: Patient;
  appointments: Appointment[];
  businessConfig: BusinessConfig;
  onLogout: () => void;
  onNewAppointment: () => void;
  onCancelAppointment?: (id: string) => void;
  onUpdateProfile?: (patient: Patient) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ patient, appointments, businessConfig, onLogout, onNewAppointment, onCancelAppointment, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'profile' | 'gallery'>('appointments');

  const myAppointments = appointments.filter(a => a.patientId === patient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCancel = (id: string) => {
      if(confirm('¿Deseas cancelar esta cita?')) {
          if(onCancelAppointment) onCancelAppointment(id);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileDocument['category']) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const newDoc: FileDocument = {
                id: `pdoc-${Date.now()}`,
                name: file.name,
                type: file.type.includes('pdf') ? 'pdf' : 'image',
                url: reader.result as string,
                category,
                uploadDate: new Date().toISOString().split('T')[0]
            };
            const currentDocs = patient.documents || [];
            onUpdateProfile({ ...patient, documents: [...currentDocs.filter(d => d.category !== category), newDoc] });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onUpdateProfile) {
          const reader = new FileReader();
          reader.onloadend = () => onUpdateProfile({ ...patient, avatarUrl: reader.result as string });
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-4 w-full">
            <div className="relative group">
                <img src={patient.avatarUrl} className="w-20 h-20 rounded-3xl object-cover border-4 border-slate-50 shadow-sm" />
                <label className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload size={20} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpdate} />
                </label>
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">Hola, {patient.fullName.split(' ')[0]}</h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Socio: {patient.clientCode}</p>
            </div>
         </div>
         <div className="flex gap-3 w-full md:w-auto">
             <button onClick={onLogout} className="flex-1 md:flex-none px-6 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 font-bold transition-all flex items-center justify-center gap-2 text-sm"><LogOut size={18} /> Salir</button>
             <button onClick={onNewAppointment} className="flex-1 md:flex-none px-8 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 font-black transition-all shadow-xl shadow-primary-100 flex items-center justify-center gap-2 text-sm">AGENDAR <Plus size={18} /></button>
         </div>
      </div>

      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto pb-1 no-scrollbar gap-2">
         {[
             { id: 'appointments', label: 'Mis Citas', icon: Calendar },
             { id: 'history', label: 'Mi Historia', icon: FileText },
             { id: 'gallery', label: 'Mi Progreso', icon: ImageIcon },
             { id: 'profile', label: 'Mi Perfil e INE', icon: User }
         ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 whitespace-nowrap ${activeTab === t.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><t.icon size={16}/> {t.label}</button>
         ))}
      </div>

      {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b pb-4 mb-4">Información de la Cuenta</h3>
                      <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Nombre Completo</span><span className="text-sm font-bold">{patient.fullName}</span></div>
                          <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Email</span><span className="text-sm font-bold">{patient.email}</span></div>
                          <div className="flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Teléfono Usuario</span><span className="text-sm font-bold">{patient.phone}</span></div>
                      </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b pb-4 mb-4 flex items-center gap-2"><Shield className="text-primary-600" size={16}/> Validación de Identidad (INE)</h3>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">Para cumplir con normativas de salud, es necesario cargar tu identificación oficial.</p>
                      
                      <div className="space-y-3">
                          {['ine_front', 'ine_back'].map(cat => {
                              const doc = (patient.documents || []).find(d => d.category === cat);
                              return (
                                  <div key={cat} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${doc ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                              {doc ? <CheckCircle2 size={20}/> : <ImageIcon size={20}/>}
                                          </div>
                                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{cat === 'ine_front' ? 'Frente INE' : 'Vuelta INE'}</span>
                                      </div>
                                      {doc ? (
                                          <div className="flex gap-1">
                                              <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-primary-600 hover:bg-white rounded-lg transition-colors"><Eye size={16}/></a>
                                              <button onClick={() => onUpdateProfile && onUpdateProfile({...patient, documents: (patient.documents || []).filter(d => d.id !== doc.id)})} className="p-2 text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                                          </div>
                                      ) : (
                                          <label className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-primary-600 transition-colors">
                                              Subir
                                              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, cat as any)} />
                                          </label>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Mantenemos lógica de otros tabs... */}
      {activeTab === 'appointments' && (
          <div className="space-y-4">
              {myAppointments.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                      <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
                      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No tienes citas pendientes</p>
                  </div>
              ) : (
                  myAppointments.map(apt => (
                      <div key={apt.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-5 w-full">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${apt.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{apt.time.split(':')[0]}</div>
                              <div><h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter leading-none">{apt.service}</h3><p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2"><Calendar size={14} className="text-primary-500"/> {apt.date} • <Clock size={14} className="text-primary-500"/> {apt.time} hrs</p></div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto">
                                <span className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{apt.status === 'confirmed' ? 'Confirmada' : 'En Espera'}</span>
                                {apt.status === 'pending' && <button onClick={() => handleCancel(apt.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><XCircle size={20}/></button>}
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}
    </div>
  );
};

export default ClientPortal;
