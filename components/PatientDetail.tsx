
import React, { useState } from 'react';
import { Patient, TreatmentSuggestion, ClinicalNote, ProgressPhoto, Employee, Product, ClinicalNoteMaterial, FileDocument } from '../types';
import { 
    ArrowLeft, 
    Sparkles, 
    HeartPulse, 
    StickyNote, 
    Lock, 
    UserCheck, 
    Calendar, 
    ShieldCheck,
    KeyRound,
    Smartphone,
    User,
    ChevronRight,
    RefreshCw,
    FileText,
    UserX,
    ToggleLeft,
    ToggleRight,
    Beaker,
    Package,
    Minus,
    Plus,
    X,
    Edit2,
    Save,
    Image as ImageIcon,
    Trash2,
    Upload,
    Eye,
    Shield,
    Info,
    Mail,
    UserPlus,
    Fingerprint
} from 'lucide-react';
import { generateTreatmentSuggestion } from '../services/geminiService';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onConsumeStock?: (note: ClinicalNote) => void;
  employees: Employee[]; 
  products: Product[];
  currentUser: Employee;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack, onUpdatePatient, onDeletePatient, onConsumeStock, employees, products, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'profile' | 'docs' | 'security' | 'ai' | 'gallery'>('history');
  const [aiSuggestion, setAiSuggestion] = useState<TreatmentSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConcern, setAiConcern] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Forms states
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTreatment, setNewNoteTreatment] = useState('');
  const [newNoteObs, setNewNoteObs] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<ClinicalNoteMaterial[]>([]);
  const [isEditingRecs, setIsEditingRecs] = useState(false);
  const [recommendations, setRecommendations] = useState(patient.clinicRecommendations || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Patient>(patient);

  // Security State
  const [newPassword, setNewPassword] = useState(patient.password || '');
  const [showPass, setShowPass] = useState(false);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileDocument['category']) => {
    const file = e.target.files?.[0];
    if (file) {
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
            onUpdatePatient({ ...patient, documents: [...currentDocs.filter(d => d.category !== category), newDoc] });
        };
        reader.readAsDataURL(file);
    }
  };

  const removeDoc = (id: string) => {
      onUpdatePatient({ ...patient, documents: (patient.documents || []).filter(d => d.id !== id) });
  };

  const handleAiGenerate = async () => {
    if (!aiConcern.trim()) return;
    setAiLoading(true); setAiError(null);
    try {
      const suggestion = await generateTreatmentSuggestion(patient, aiConcern);
      setAiSuggestion(suggestion);
    } catch (err: any) { setAiError("IA no disponible."); } finally { setAiLoading(false); }
  };

  const handleSaveEdit = () => { onUpdatePatient(editForm); setIsEditing(false); };

  const handleUpdatePassword = () => {
      if (newPassword.length < 4) { alert("La contraseña es muy corta"); return; }
      onUpdatePatient({...patient, password: newPassword});
      alert("Contraseña actualizada correctamente");
  };

  const toggleBlockStatus = () => {
      const newStatus = !patient.isBlocked;
      if (confirm(`¿Realmente deseas ${newStatus ? 'BLOQUEAR' : 'DESBLOQUEAR'} a este paciente?`)) {
          onUpdatePatient({...patient, isBlocked: newStatus});
      }
  };

  const inputClass = "w-full p-3 bg-white border border-slate-300 rounded-2xl text-slate-900 focus:ring-4 focus:ring-primary-50 outline-none transition-all";

  const DocumentSlot = ({ category, label }: { category: FileDocument['category'], label: string }) => {
    const doc = (patient.documents || []).find(d => d.category === category);
    return (
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${doc ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-400'}`}>
                    {doc ? (doc.type === 'image' ? <img src={doc.url} className="w-full h-full object-cover rounded-2xl" /> : <FileText size={28}/>) : <Shield size={28}/>}
                </div>
                <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{label}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{doc ? `Cargado: ${doc.uploadDate}` : 'No cargado'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {doc ? (
                    <>
                        <a href={doc.url} target="_blank" rel="noreferrer" className="p-3 bg-white text-primary-600 rounded-xl shadow-sm hover:shadow-md transition-all"><Eye size={18}/></a>
                        <button onClick={() => removeDoc(doc.id)} className="p-3 bg-white text-red-500 rounded-xl shadow-sm hover:shadow-md transition-all"><Trash2 size={18}/></button>
                    </>
                ) : (
                    <label className="p-3 bg-slate-900 text-white rounded-xl shadow-sm hover:bg-primary-600 cursor-pointer transition-all">
                        <Upload size={18}/>
                        <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, category)} />
                    </label>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="animate-fade-in pb-20">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold uppercase tracking-widest gap-2">
        <ArrowLeft size={18} /> Volver a Expedientes
      </button>

      {/* Unified Header Card */}
      <div className={`rounded-[3rem] shadow-xl border p-8 mb-8 relative overflow-hidden transition-colors ${patient.isBlocked ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100 shadow-slate-100/50'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full -mr-20 -mt-20 blur-3xl opacity-30 ${patient.isBlocked ? 'bg-red-500' : 'bg-primary-50'}`}></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="relative group">
                  <img src={patient.avatarUrl} className={`w-32 h-32 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white ${patient.isBlocked ? 'grayscale' : ''}`} />
                  <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload size={24} />
                        <span className="text-[8px] font-black uppercase mt-1">Cambiar Foto</span>
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const r = new FileReader();
                                r.onloadend = () => onUpdatePatient({...patient, avatarUrl: r.result as string});
                                r.readAsDataURL(file);
                            }
                        }} />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 p-2 rounded-2xl shadow-lg border border-slate-50 ${patient.isBlocked ? 'bg-red-600 text-white' : 'bg-white text-primary-600'}`}>
                      {patient.isBlocked ? <Lock size={24} /> : <ShieldCheck size={24} />}
                  </div>
              </div>

              <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-black text-slate-900">{patient.fullName}</h1>
                      {patient.isBlocked && <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">BLOQUEADO</span>}
                      <span className="bg-slate-100 text-slate-600 text-xs font-black px-3 py-1 rounded-full uppercase">Exp: #{patient.fileNumber}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary-500"/> {calculateAge(patient.birthDate)} años</span>
                      <span className="flex items-center gap-1.5"><HeartPulse size={16} className="text-rose-500"/> Piel {patient.skinType}</span>
                      <span className="flex items-center gap-1.5"><Smartphone size={16} className="text-blue-500"/> {patient.phone}</span>
                  </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => setIsEditing(true)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"><Edit2 size={18} /> Editar</button>
                  <button onClick={() => setActiveTab('ai')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"><Sparkles size={18} /> IA</button>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar gap-2">
        {[
            { id: 'history', label: 'Historia Clínica', icon: FileText },
            { id: 'gallery', label: 'Fotos Progreso', icon: ImageIcon },
            { id: 'docs', label: 'ID y Documentos', icon: Shield },
            { id: 'security', label: 'Seguridad y Acceso', icon: Lock },
            { id: 'profile', label: 'Datos Generales', icon: User },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`px-6 py-4 font-bold text-[10px] uppercase tracking-widest transition-all border-b-4 flex items-center gap-2 whitespace-nowrap ${activeTab === t.id ? 'border-primary-500 text-primary-600 bg-primary-50/50 rounded-t-2xl' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><t.icon size={16} /> {t.label}</button>
        ))}
      </div>

      {/* Tab Historial */}
      {activeTab === 'history' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-black text-slate-900">Bitácora Clínica</h3>
                      <button onClick={() => setShowAddNote(true)} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-100"><Plus size={16} /> NUEVA NOTA</button>
                  </div>
                  {patient.history.length === 0 ? <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 text-xs font-black uppercase">Sin registros aún</div> : patient.history.map(n => <div key={n.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{n.date}</span><span className="text-[10px] font-black text-primary-600 uppercase">Terap: {n.therapistName || 'Maine Staff'}</span></div><h4 className="font-black text-slate-900 text-lg">{n.treatment}</h4><p className="text-slate-600 text-sm mt-1">{n.observations}</p></div>)}
              </div>
              <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 h-fit">
                  <h3 className="font-black text-amber-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><StickyNote size={14}/> Recomendaciones</h3>
                  <p className="text-sm text-amber-800 italic">"{patient.clinicRecommendations || 'Sin indicaciones especiales.'}"</p>
              </div>
          </div>
      )}

      {/* Tab Datos Generales */}
      {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs border-b border-slate-50 pb-4">Información del Cliente</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Código de Socio</span><span className="font-mono font-bold bg-slate-100 px-3 py-1 rounded-lg">{patient.clientCode}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Nombre Legal</span><span className="text-sm font-bold text-slate-700">{patient.fullName}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Fecha Nacimiento</span><span className="text-sm font-bold text-slate-700">{patient.birthDate}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Contacto Principal</span><span className="text-sm font-bold text-slate-700">{patient.phone}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Email</span><span className="text-sm font-bold text-slate-700">{patient.email}</span></div>
                      <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Fecha de Alta</span><span className="text-sm font-bold text-slate-700">{patient.registrationDate || 'N/A'}</span></div>
                  </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl">
                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs border-b border-slate-50 pb-4 flex items-center gap-2"><HeartPulse size={16} className="text-rose-500"/> Ficha Médica</h3>
                    <div className="mt-6 space-y-4">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Tipo de Piel</label><div className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-2xl">{patient.skinType}</div></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Alergias Conocidas</label><div className="text-sm font-bold text-rose-700 bg-rose-50 p-3 rounded-2xl border border-rose-100">{patient.allergies}</div></div>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl">
                    <h3 className="font-black uppercase tracking-[0.2em] text-xs border-b border-white/10 pb-4 flex items-center gap-2"><Smartphone size={16} className="text-teal-400"/> Contacto de Emergencia</h3>
                    <div className="mt-6">
                        <p className="text-xl font-bold">{patient.emergencyContact.name}</p>
                        <p className="text-teal-400 font-mono font-bold mt-1 text-lg">{patient.emergencyContact.phone}</p>
                    </div>
                </div>
              </div>
          </div>
      )}

      {/* Tab Seguridad */}
      {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><KeyRound size={120} /></div>
                  <div className="relative z-10">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3"><Lock className="text-primary-600"/> Credenciales del Paciente</h3>
                      
                      <div className="space-y-6">
                          <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">Contraseña de Acceso App</label>
                              <div className="flex gap-3">
                                  <div className="relative flex-1">
                                      <input 
                                          type={showPass ? "text" : "password"} 
                                          value={newPassword}
                                          onChange={e => setNewPassword(e.target.value)}
                                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-mono focus:ring-4 focus:ring-primary-50 outline-none transition-all"
                                      />
                                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary-600 transition-colors">
                                          {showPass ? <Eye size={20}/> : <ImageIcon size={20}/>}
                                      </button>
                                  </div>
                                  <button onClick={handleUpdatePassword} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all">Actualizar</button>
                              </div>
                          </div>

                          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
                              <Info size={24} className="text-blue-500 shrink-0 mt-1" />
                              <div>
                                  <p className="text-xs text-blue-900 font-bold mb-1">Nota de Seguridad:</p>
                                  <p className="text-[11px] text-blue-700 leading-relaxed">El cliente usa su <strong>Teléfono</strong> como identificador y esta clave para entrar a su portal de citas y promociones.</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className={`p-8 rounded-[3.5rem] border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${patient.isBlocked ? 'bg-red-600 text-white border-red-700 shadow-xl shadow-red-200' : 'bg-white border-slate-100 text-slate-900 shadow-lg'}`}>
                  <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-[2rem] ${patient.isBlocked ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>
                          {patient.isBlocked ? <ShieldCheck size={32}/> : <UserX size={32}/>}
                      </div>
                      <div>
                          <h4 className="font-black uppercase tracking-widest text-sm">{patient.isBlocked ? 'Acceso Restringido' : 'Estado de Cuenta Activo'}</h4>
                          <p className={`text-[11px] font-medium ${patient.isBlocked ? 'text-white/80' : 'text-slate-400'}`}>
                              {patient.isBlocked ? 'Este paciente no puede iniciar sesión en la App.' : 'El paciente tiene acceso normal a todas las funciones.'}
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={toggleBlockStatus}
                    className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${patient.isBlocked ? 'bg-white text-red-600 hover:bg-slate-100' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100'}`}
                  >
                      {patient.isBlocked ? 'Desbloquear Acceso' : 'Bloquear Cuenta'}
                  </button>
              </div>
          </div>
      )}

      {/* Tab Docs */}
      {activeTab === 'docs' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3"><Shield className="text-primary-600"/> Identificación Oficial (KYC)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DocumentSlot category="ine_front" label="INE Frente (Identidad)" />
                      <DocumentSlot category="ine_back" label="INE Vuelta (Identidad)" />
                  </div>
              </div>
              <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white">
                   <h4 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-2"><Info size={16} className="text-primary-400"/> Aviso de Privacidad</h4>
                   <p className="text-xs text-slate-400 leading-relaxed">Toda la documentación está protegida bajo la Ley Federal de Protección de Datos Personales. El uso es exclusivo para validación clínica.</p>
              </div>
          </div>
      )}

      {/* Tab IA */}
      {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
              <div className="bg-white p-8 rounded-[3.5rem] border border-primary-100 shadow-2xl">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 flex items-center gap-3"><Sparkles className="text-primary-500"/> Análisis con Inteligencia Artificial</h3>
                  <p className="text-slate-500 text-sm mb-6">Describe la preocupación actual del paciente para generar una sugerencia de tratamiento basada en su perfil clínico.</p>
                  
                  <div className="space-y-4">
                      <textarea 
                        value={aiConcern}
                        onChange={e => setAiConcern(e.target.value)}
                        placeholder="Ej: Presenta enrojecimiento en zona T y busca un protocolo rejuvenecedor..."
                        className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-slate-800 outline-none focus:ring-4 focus:ring-primary-50 transition-all resize-none"
                      />
                      <button 
                        onClick={handleAiGenerate}
                        disabled={aiLoading || !aiConcern.trim()}
                        className="w-full bg-primary-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-primary-700 transition-all shadow-xl shadow-primary-100 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                          {aiLoading ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                          {aiLoading ? 'ANALIZANDO PERFIL...' : 'GENERAR SUGERENCIA MÉDICA'}
                      </button>
                  </div>
              </div>

              {aiSuggestion && (
                  <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl animate-slide-down space-y-8 border-t-8 border-primary-500">
                      <div><h4 className="text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Plan de Protocolo</h4><p className="text-lg leading-relaxed whitespace-pre-wrap">{aiSuggestion.plan}</p></div>
                      <div>
                          <h4 className="text-primary-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Activos y Productos</h4>
                          <div className="flex flex-wrap gap-2">{aiSuggestion.products.map((p, i) => <span key={i} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold border border-white/10">{p}</span>)}</div>
                      </div>
                      <div className="bg-primary-900/40 p-6 rounded-3xl border border-primary-500/20"><h4 className="text-primary-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Consejo de Vida</h4><p className="text-sm italic opacity-90">"{aiSuggestion.lifestyleAdvice}"</p></div>
                  </div>
              )}
          </div>
      )}

      {isEditing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-down max-h-[90vh] flex flex-col">
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                      <h3 className="font-black uppercase tracking-widest">Actualizar Perfil</h3>
                      <button onClick={() => setIsEditing(false)} className="text-slate-400"><X size={24}/></button>
                  </div>
                  <div className="p-8 space-y-6 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nombre Completo</label><input className={inputClass} value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Teléfono</label><input className={inputClass} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} maxLength={10} /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Email</label><input className={inputClass} value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                        <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Fecha Nac.</label><input type="date" className={inputClass} value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} /></div>
                      </div>
                      <div className="pt-6 flex gap-4">
                          <button onClick={() => setIsEditing(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancelar</button>
                          <button onClick={handleSaveEdit} className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl">GUARDAR CAMBIOS</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default PatientDetail;
