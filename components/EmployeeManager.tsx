
import React, { useState } from 'react';
import { Employee, Permission, EmployeeStatus, FileDocument } from '../types';
import { 
    Plus, 
    Trash2, 
    User, 
    Lock, 
    Image as ImageIcon, 
    Check, 
    Smartphone, 
    Edit2, 
    UserX, 
    UserCheck, 
    Briefcase,
    Calendar,
    Award,
    ChevronRight,
    X,
    MapPin,
    CreditCard,
    HeartPulse,
    Info,
    Hash,
    LogIn,
    FileText,
    Shield,
    Upload,
    Eye,
    File,
    Cake,
    KeyRound,
    AlertCircle,
    UserMinus,
    RefreshCw
} from 'lucide-react';
import { JOB_TITLES, MEXICAN_BANKS } from '../constants';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onSwitchUser: (emp: Employee) => void;
}

const PERMISSION_LIST: { id: Permission; label: string }[] = [
    { id: 'view_appointments', label: 'Citas' },
    { id: 'edit_appointments', label: 'Agenda' },
    { id: 'view_patients', label: 'Expedientes' },
    { id: 'edit_patients', label: 'Tratamientos' },
    { id: 'view_finance', label: 'Finanzas' },
    { id: 'manage_inventory', label: 'Almacén' },
    { id: 'manage_settings', label: 'Configuración' },
    { id: 'manage_employees', label: 'RRHH' },
];

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, onSwitchUser }) => {
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [tab, setTab] = useState<'info' | 'address' | 'banking' | 'docs' | 'permissions'>('info');

    // Form State - General
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [hireDate, setHireDate] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<EmployeeStatus>('active');

    // Form State - Address
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');

    // Form State - Banking
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [clabe, setClabe] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    // Form State - Emergency
    const [emergName, setEmergName] = useState('');
    const [emergPhone, setEmergPhone] = useState('');
    const [emergRelation, setEmergRelation] = useState('');

    // Form State - Documents
    const [documents, setDocuments] = useState<FileDocument[]>([]);

    // Form State - Permissions
    const [permissions, setPermissions] = useState<Permission[]>([]);

    const resetForm = () => {
        setEditId(null); setFullName(''); setEmail(''); setPhone(''); setBirthDate('');
        setHireDate(new Date().toISOString().split('T')[0]); setJobTitle(''); setRole('');
        setPassword(''); setPermissions([]); setAvatarUrl(null); setStatus('active');
        setStreet(''); setCity(''); setState(''); setZip('');
        setBankName(''); setAccountNumber(''); setClabe(''); setCardNumber(''); setAccountHolder('');
        setEmergName(''); setEmergPhone(''); setEmergRelation('');
        setDocuments([]);
        setTab('info');
    };

    const handleEdit = (emp: Employee) => {
        setEditId(emp.id); setFullName(emp.fullName); setEmail(emp.email); setPhone(emp.phone);
        setBirthDate(emp.birthDate); setHireDate(emp.hireDate); setJobTitle(emp.jobTitle);
        setRole(emp.role); setPassword(emp.password || ''); setPermissions(emp.permissions);
        setAvatarUrl(emp.avatarUrl); setStatus(emp.status);
        setDocuments(emp.documents || []);
        
        if (emp.address) {
            setStreet(emp.address.street); setCity(emp.address.city); 
            setState(emp.address.state); setZip(emp.address.zip);
        }
        
        if (emp.bankingInfo) {
            setBankName(emp.bankingInfo.bankName); setAccountNumber(emp.bankingInfo.accountNumber);
            setClabe(emp.bankingInfo.clabe); setCardNumber(emp.bankingInfo.cardNumber);
            setAccountHolder(emp.bankingInfo.accountHolder);
        }

        if (emp.emergencyContact) {
            setEmergName(emp.emergencyContact.name); setEmergPhone(emp.emergencyContact.phone);
            setEmergRelation(emp.emergencyContact.relation);
        }

        setShowModal(true);
    };

    const handleQuickResetPass = (emp: Employee) => {
        const newPass = prompt(`Ingresa la nueva contraseña para ${emp.fullName}:`, "Maine1234");
        if (newPass) {
            onUpdateEmployee({...emp, password: newPass});
            alert("Contraseña actualizada.");
        }
    };

    const toggleEmployeeStatus = (emp: Employee) => {
        const newStatus = emp.status === 'active' ? 'suspended' : 'active';
        if (confirm(`¿Realmente deseas ${newStatus === 'active' ? 'ACTIVAR' : 'SUSPENDER'} a este colaborador?`)) {
            onUpdateEmployee({...emp, status: newStatus});
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileDocument['category']) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newDoc: FileDocument = {
                    id: `doc-${Date.now()}`,
                    name: file.name,
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    url: reader.result as string,
                    category,
                    uploadDate: new Date().toISOString().split('T')[0]
                };
                setDocuments(prev => [...prev.filter(d => d.category !== category), newDoc]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const empData: Employee = {
            id: editId || `e-${Date.now()}`,
            fullName, email, phone, birthDate, hireDate, jobTitle, role, password,
            permissions, avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${fullName}&background=random`,
            workSchedule: [], attendanceLog: [], status,
            address: { street, city, state, zip },
            bankingInfo: { bankName, accountNumber, clabe, cardNumber, accountHolder },
            emergencyContact: { name: emergName, phone: emergPhone, relation: emergRelation },
            documents
        };

        if (editId) onUpdateEmployee(empData);
        else onAddEmployee(empData);
        setShowModal(false); resetForm();
    };

    const togglePermission = (perm: Permission) => {
        setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
    };

    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all placeholder:text-slate-400";
    const labelClass = "text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1 tracking-widest";

    const DocumentCard = ({ category, label, icon: Icon }: any) => {
        const doc = documents.find(d => d.category === category);
        return (
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 group relative overflow-hidden">
                {doc ? (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 relative">
                           {doc.type === 'image' ? <img src={doc.url} className="w-full h-full object-cover rounded-2xl" /> : <FileText size={32} />}
                           <button onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[120px]">{label}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Cargado: {doc.uploadDate}</p>
                        </div>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="mt-2 text-[10px] font-black text-primary-600 hover:underline flex items-center gap-1"><Eye size={12}/> VER ARCHIVO</a>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                           <Icon size={32} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
                            <p className="text-[8px] text-slate-300 font-bold uppercase mt-1">Pendiente de carga</p>
                        </div>
                        <label className="mt-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase cursor-pointer hover:bg-primary-600 transition-colors flex items-center gap-1">
                            <Upload size={10}/> Subir
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, category)} />
                        </label>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Award className="text-primary-600" /> Capital Humano
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Gestión administrativa y expedientes de especialistas.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Nuevo Especialista
                </button>
            </div>

            {/* Grid de Expedientes RRHH */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {employees.map(emp => (
                    <div key={emp.id} className={`bg-white rounded-[3rem] border overflow-hidden transition-all group relative ${emp.status !== 'active' ? 'border-red-100 bg-red-50/10 grayscale opacity-80' : 'border-slate-100 shadow-xl hover:shadow-2xl'}`}>
                        <div className={`h-28 ${emp.status === 'active' ? 'bg-primary-600' : 'bg-red-500'} relative p-4 flex justify-end gap-2`}>
                            <button 
                                onClick={() => onSwitchUser(emp)} 
                                title="Iniciar sesión como este usuario"
                                className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors"
                            >
                                <LogIn size={18}/>
                            </button>
                            <button onClick={() => onDeleteEmployee(emp.id)} className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-700 transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>

                        <div className="px-8 pb-8 -mt-14 relative z-10">
                            <div className="flex justify-between items-end mb-6">
                                <div className="relative">
                                    <img src={emp.avatarUrl} className="w-28 h-28 rounded-[2.5rem] border-4 border-white object-cover shadow-2xl group-hover:rotate-3 transition-transform" />
                                    <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl border-4 border-white shadow-xl text-white ${emp.status === 'active' ? 'bg-green-500' : 'bg-red-600'}`}>
                                        {emp.status === 'active' ? <UserCheck size={16}/> : <UserX size={16}/>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${emp.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {emp.status === 'active' ? 'Activo' : 'Suspendido'}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">{emp.fullName}</h3>
                                <p className="text-[11px] font-black text-primary-600 uppercase tracking-[0.2em] mt-2 border-b border-slate-50 pb-4">{emp.jobTitle}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Smartphone size={10}/> Login ID</p>
                                    <p className="text-sm font-bold text-slate-900">{emp.phone}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Lock size={10}/> Password</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{emp.password}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><Cake size={16}/></div>
                                    <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cumpleaños</p><p className="text-xs font-bold text-slate-700">{emp.birthDate}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><Calendar size={16}/></div>
                                    <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Ingreso</p><p className="text-xs font-bold text-slate-700">{emp.hireDate}</p></div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleEmployeeStatus(emp)}
                                    className={`flex-1 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${emp.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : 'bg-green-600 text-white hover:bg-green-700 shadow-xl shadow-green-100'}`}
                                >
                                    {emp.status === 'active' ? <UserMinus size={14}/> : <UserCheck size={14}/>}
                                    {emp.status === 'active' ? 'Suspender' : 'Activar'}
                                </button>
                                <button 
                                    onClick={() => handleQuickResetPass(emp)}
                                    className="flex-1 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-100"
                                >
                                    <RefreshCw size={14}/> Clave
                                </button>
                                <button 
                                    onClick={() => handleEdit(emp)}
                                    className="p-4 bg-slate-100 text-slate-600 rounded-[1.5rem] hover:bg-slate-200 transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Expediente Maestro */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-down flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500 rounded-2xl"><Briefcase size={20}/></div>
                                <div>
                                    <h3 className="font-bold text-xl uppercase tracking-widest leading-none">{editId ? 'Expediente del Especialista' : 'Alta de Personal'}</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Archivo Clínico Administrativo</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50 overflow-x-auto no-scrollbar">
                            <button onClick={() => setTab('info')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'info' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}><Info size={14}/> General</button>
                            <button onClick={() => setTab('address')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'address' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}><MapPin size={14}/> Domicilio</button>
                            <button onClick={() => setTab('banking')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'banking' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}><CreditCard size={14}/> Nómina</button>
                            <button onClick={() => setTab('docs')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'docs' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}><Shield size={14}/> Documentación</button>
                            <button onClick={() => setTab('permissions')} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'permissions' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-slate-400'}`}><Lock size={14}/> Seguridad</button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
                            {tab === 'info' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="flex items-center gap-6">
                                        <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                            {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Upload size={24} />
                                                <span className="text-[8px] font-black uppercase mt-1">Cambiar Foto</span>
                                            </div>
                                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const r = new FileReader();
                                                    r.onloadend = () => setAvatarUrl(r.result as string);
                                                    r.readAsDataURL(file);
                                                }
                                            }} />
                                        </div>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className={labelClass}>Nombre Completo</label><input required value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} placeholder="Ej: Dr. Juan Pérez" /></div>
                                            <div><label className={labelClass}>Título / Puesto</label><select required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={inputClass}><option value="">Puesto...</option>{JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div><label className={labelClass}>Email Corporativo</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="staff@maine.com" /></div>
                                        <div><label className={labelClass}>Teléfono Personal</label><input required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} maxLength={10} placeholder="10 dígitos" /></div>
                                        <div><label className={labelClass}>Fecha de Nacimiento</label><input type="date" required value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} style={{colorScheme: 'light'}} /></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><label className={labelClass}>Fecha de Alta</label><input type="date" required value={hireDate} onChange={e => setHireDate(e.target.value)} className={inputClass} style={{colorScheme: 'light'}} /></div>
                                        <div><label className={labelClass}>Estatus Operativo</label><select value={status} onChange={e => setStatus(e.target.value as any)} className={inputClass}><option value="active">Activo</option><option value="suspended">Suspendido</option><option value="terminated">Baja</option></select></div>
                                    </div>

                                    <div className="p-5 bg-rose-50 rounded-[2rem] border border-rose-100">
                                        <h4 className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-3 flex items-center gap-2"><HeartPulse size={14}/> Contacto de Emergencia</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <input value={emergName} onChange={e => setEmergName(e.target.value)} className={inputClass} placeholder="Nombre contacto" />
                                            <input value={emergPhone} onChange={e => setEmergPhone(e.target.value)} className={inputClass} placeholder="Teléfono" maxLength={10} />
                                            <input value={emergRelation} onChange={e => setEmergRelation(e.target.value)} className={inputClass} placeholder="Parentesco" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'address' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin size={14}/> Domicilio Localizable</h4>
                                        <div className="space-y-4">
                                            <div><label className={labelClass}>Calle y Número</label><input value={street} onChange={e => setStreet(e.target.value)} className={inputClass} placeholder="Ej: Av. Reforma 123 Int 4" /></div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div><label className={labelClass}>Ciudad / Delegación</label><input value={city} onChange={e => setCity(e.target.value)} className={inputClass} /></div>
                                                <div><label className={labelClass}>Estado</label><input value={state} onChange={e => setState(e.target.value)} className={inputClass} /></div>
                                                <div><label className={labelClass}>CP</label><input value={zip} onChange={e => setZip(e.target.value)} className={inputClass} maxLength={5} /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'banking' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={14}/> Datos Bancarios de Dispersión</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className={labelClass}>Institución Bancaria</label><select value={bankName} onChange={e => setBankName(e.target.value)} className={inputClass}><option value="">Elegir Banco...</option>{MEXICAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                                <div><label className={labelClass}>Titular de la Cuenta</label><input value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className={inputClass} placeholder="Nombre completo" /></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className={labelClass}>CLABE (18 dígitos)</label><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input value={clabe} onChange={e => setClabe(e.target.value)} className={`${inputClass} pl-10`} maxLength={18} placeholder="000000000000000000" /></div></div>
                                                <div><label className={labelClass}>No. Tarjeta (16 dígitos)</label><div className="relative"><CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/><input value={cardNumber} onChange={e => setCardNumber(e.target.value)} className={`${inputClass} pl-10`} maxLength={16} placeholder="0000 0000 0000 0000" /></div></div>
                                            </div>
                                            <div><label className={labelClass}>Número de Cuenta</label><input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputClass} /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tab === 'docs' && (
                                <div className="animate-fade-in">
                                    <div className="mb-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield size={14}/> Archivos de Identidad y Especialidad</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <DocumentCard category="ine_front" label="INE Frente" icon={ImageIcon} />
                                            <DocumentCard category="ine_back" label="INE Vuelta" icon={ImageIcon} />
                                            <DocumentCard category="license" label="Cédula Prof." icon={Shield} />
                                            <DocumentCard category="degree" label="Título/Diploma" icon={Award} />
                                        </div>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                        <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-amber-800 font-medium">Los documentos se almacenan para cumplimiento legal y regulatorio (COFEPRIS). Soporta formatos Imagen y PDF.</p>
                                    </div>
                                </div>
                            )}

                            {tab === 'permissions' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Lock size={20} className="text-primary-400" />
                                            <div>
                                                <h4 className="font-bold uppercase tracking-widest text-sm leading-none">Credenciales de Acceso</h4>
                                                <p className="text-[10px] text-slate-500 uppercase mt-1">Acceso para la Aplicación Administrativa</p>
                                            </div>
                                        </div>
                                        <input required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-50 font-mono text-center text-lg" placeholder="Contraseña de sistema" />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Permisos de Módulo</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {PERMISSION_LIST.map(p => (
                                                <button 
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => togglePermission(p.id)}
                                                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all group ${permissions.includes(p.id) ? 'bg-primary-50 border-primary-200 text-primary-900 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-primary-100'}`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{p.label}</span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${permissions.includes(p.id) ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-200 group-hover:border-primary-300'}`}>
                                                        {permissions.includes(p.id) && <Check size={14}/>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Descartar</button>
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all uppercase tracking-widest text-xs">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManager;
