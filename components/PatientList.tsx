
import React, { useState, useEffect } from 'react';
import { Patient, Employee } from '../types';
import { 
  Search, 
  Plus, 
  UserPlus,
  ChevronRight, 
  X, 
  User, 
  Phone, 
  Calendar, 
  HeartPulse, 
  Image as ImageIcon, 
  Trash2, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  MessageCircle,
  MoreHorizontal,
  FileText,
  KeyRound,
  Fingerprint,
  UserX,
  LogIn,
  RefreshCw,
  UserMinus,
  ExternalLink
} from 'lucide-react';
import { generateWhatsAppLink } from '../services/notificationService';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onAddPatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onUpdatePatient: (patient: Patient) => void;
  onLoginAsPatient: (patient: Patient) => void;
  startOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  currentUser: Employee; 
  canDelete: boolean; 
}

const PatientList: React.FC<PatientListProps> = ({ 
  patients, 
  onSelectPatient, 
  onAddPatient,
  onDeletePatient,
  onUpdatePatient,
  onLoginAsPatient,
  startOpen = false,
  onOpenChange,
  currentUser,
  canDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (startOpen) setShowModal(true);
  }, [startOpen]);

  const handleModalClose = () => {
    setShowModal(false);
    if (onOpenChange) onOpenChange(false);
  };
  
  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newEmergName, setNewEmergName] = useState('');
  const [newEmergPhone, setNewEmergPhone] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const handleResetPassword = (patient: Patient) => {
    const newPass = prompt(`Nueva contraseña para ${patient.fullName}:`, "Maine1234");
    if (newPass) {
        onUpdatePatient({...patient, password: newPass});
        alert("Contraseña actualizada exitosamente.");
    }
  };

  const toggleBlockStatus = (patient: Patient) => {
      const newStatus = !patient.isBlocked;
      if (confirm(`¿Realmente deseas ${newStatus ? 'BLOQUEAR' : 'DESBLOQUEAR'} el acceso de ${patient.fullName}?`)) {
          onUpdatePatient({...patient, isBlocked: newStatus});
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setNewAvatar(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const generateClientCode = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0,3).toUpperCase();
    const random = Math.floor(10000 + Math.random() * 90000); 
    return `${initials}${random}`;
  };

  const validatePassword = (pwd: string) => pwd.length >= 4;
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanPhone(newPhone).length !== 10) { alert("El teléfono debe tener 10 dígitos."); return; }
    if (!validatePassword(newPassword)) { alert("La contraseña requiere al menos 4 caracteres."); return; }
    if (newPassword !== confirmPassword) { alert("Las contraseñas no coinciden."); return; }

    const newPatient: Patient = {
        id: `p${Date.now()}`,
        clientCode: generateClientCode(newName),
        fileNumber: (100 + patients.length).toString().padStart(4, '0'),
        fullName: newName,
        email: newEmail,
        password: newPassword,
        phone: newPhone,
        birthDate: newBirthDate,
        skinType: 'Por definir',
        allergies: newAllergies || 'Ninguna',
        emergencyContact: { name: newEmergName, phone: newEmergPhone },
        avatarUrl: newAvatar || `https://ui-avatars.com/api/?name=${newName.replace(' ', '+')}&background=random`,
        history: [],
        progressPhotos: [],
        clinicRecommendations: '',
        registeredBy: currentUser.fullName,
        registrationDate: new Date().toISOString().split('T')[0],
        assignedTherapist: '',
        isBlocked: false
    };
    
    onAddPatient(newPatient);
    handleModalClose();
  };

  const inputClass = "w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-200 outline-none bg-white text-slate-900";

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Fingerprint className="text-primary-600" /> Archivo de Clientes
          </h2>
          <p className="text-slate-500 text-sm font-medium">Control maestro de accesos, seguridad y expedientes clínicos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} /> Alta de Cliente
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Nombre, Teléfono, Código o Email..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl text-xs font-black text-slate-500 uppercase">
             Total: {filteredPatients.length}
          </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              className={`bg-white rounded-[3rem] border transition-all overflow-hidden relative group flex flex-col ${patient.isBlocked ? 'border-red-100 bg-red-50/10 grayscale opacity-80' : 'border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-2xl'}`}
            >
              {/* Header con estatus y login rapido */}
              <div className={`p-4 flex justify-end gap-2 ${patient.isBlocked ? 'bg-red-500' : 'bg-primary-600'}`}>
                   <button 
                    onClick={() => onLoginAsPatient(patient)}
                    title="Entrar a la App como este cliente"
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-colors"
                  >
                      <LogIn size={16} />
                  </button>
                  {canDelete && (
                      <button 
                        onClick={() => onDeletePatient(patient.id)}
                        className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-red-700 transition-colors"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
              </div>

              <div className="px-8 pb-8 -mt-10 relative z-10 flex-1">
                  <div className="flex justify-between items-end mb-6">
                      <div className="relative">
                          <img src={patient.avatarUrl} className="w-24 h-24 rounded-[2rem] border-4 border-white object-cover shadow-2xl group-hover:rotate-3 transition-transform" />
                          <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl border-4 border-white shadow-xl text-white ${patient.isBlocked ? 'bg-red-600' : 'bg-green-500'}`}>
                              {patient.isBlocked ? <UserX size={14} /> : <ShieldCheck size={14} />}
                          </div>
                      </div>
                      <div className="text-right">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${patient.isBlocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                              {patient.isBlocked ? 'Bloqueado' : 'Activo'}
                          </span>
                      </div>
                  </div>

                  <div className="mb-6">
                      <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{patient.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Socio: {patient.clientCode}</span>
                          <span className="bg-primary-50 text-primary-600 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Exp: #{patient.fileNumber}</span>
                      </div>
                  </div>

                  {/* Bloque de Credenciales */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={10}/> Usuario (Tel)</p>
                          <p className="text-xs font-bold text-slate-900">{patient.phone}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Lock size={10}/> Password</p>
                          <p className="text-xs font-bold text-slate-900 truncate">{patient.password || '—'}</p>
                      </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                      <button 
                        onClick={() => toggleBlockStatus(patient)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${patient.isBlocked ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'}`}
                      >
                          {patient.isBlocked ? <ShieldCheck size={12}/> : <UserMinus size={12}/>}
                          {patient.isBlocked ? 'Activar' : 'Bloquear'}
                      </button>
                      <button 
                        onClick={() => handleResetPassword(patient)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black hover:bg-primary-600 transition-all shadow-md"
                      >
                          <RefreshCw size={12}/> Clave
                      </button>
                  </div>

                  <button 
                    onClick={() => onSelectPatient(patient)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-700 transition-all flex items-center justify-center gap-2"
                  >
                      <FileText size={14} /> Gestionar Expediente Completo
                  </button>
              </div>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium font-black uppercase tracking-widest text-[10px]">No se encontraron registros</p>
            </div>
          )}
      </div>

      {/* Modal Alta de Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-down max-h-[90vh] flex flex-col">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500 rounded-2xl"><UserPlus size={24} /></div>
                        <div>
                            <h3 className="font-bold text-xl uppercase tracking-widest leading-none">Alta de Cliente</h3>
                            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Registro de Nuevo Socio Maine</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleModalClose} className="hover:bg-slate-700 p-2 rounded-full transition-colors"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Perfil Personal</h4>
                            <div className="flex items-center gap-4">
                                 <div className="w-20 h-20 rounded-[1.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 relative group">
                                    {newAvatar ? <img src={newAvatar} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                 </div>
                                 <div className="text-[10px] text-slate-400 font-bold uppercase">Sube foto de perfil</div>
                            </div>
                            <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Nombre Completo</label><input required value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} placeholder="Ej: Maria Lopez" /></div>
                            <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Fecha Nacimiento</label><input required type="date" value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} className={inputClass} style={{ colorScheme: 'light' }} /></div>
                            <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Teléfono (Usuario)</label><input required value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputClass} placeholder="10 dígitos" maxLength={10} /></div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Seguridad App</h4>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
                                <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Email (Opcional)</label><input required type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} /></div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Contraseña inicial</label>
                                    <div className="relative">
                                        <input required type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className={`${inputClass} pr-10`} placeholder="Mín 4 dígitos" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 ml-1">Confirmar clave</label>
                                    <div className="relative">
                                        <input required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`${inputClass} pr-10`} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-slate-100">
                        <button type="button" onClick={handleModalClose} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all uppercase tracking-widest text-xs">Apertura de Expediente</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;
