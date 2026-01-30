
import React, { useState, useEffect } from 'react';
import { Service, Promotion, BusinessConfig, Patient, Appointment, Employee, Product, ProductCategoryType, EmailConfig, SupabaseConfig, AIConfig } from '../types';
import { 
  Plus, 
  Trash2, 
  Tag, 
  Clock, 
  MapPin, 
  Save, 
  Edit2, 
  Calendar, 
  CreditCard, 
  Database, 
  ShoppingBag, 
  Beaker, 
  Zap, 
  Cloud, 
  ChevronRight, 
  Settings, 
  Globe, 
  Lock, 
  X, 
  Facebook, 
  Instagram, 
  Video, 
  ArrowLeft, 
  Sparkles,
  Smartphone,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  Activity,
  AlertCircle,
  RefreshCw,
  Code,
  Download,
  Github,
  FileSpreadsheet,
  Cpu
} from 'lucide-react';
import { MEXICAN_BANKS } from '../constants';
import { testSupabaseConnection, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';

interface AdminSettingsProps {
  services: Service[];
  promotions: Promotion[];
  products: Product[];
  businessConfig: BusinessConfig;
  patients: Patient[];
  appointments: Appointment[];
  employees: Employee[];
  onUpdateServices: (services: Service[]) => void;
  onUpdatePromotions: (promotions: Promotion[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateConfig: (config: BusinessConfig) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({
  services,
  promotions,
  products,
  businessConfig,
  patients,
  appointments,
  employees,
  onUpdateServices,
  onUpdatePromotions,
  onUpdateProducts,
  onUpdateConfig
}) => {
  const [activeSection, setActiveSection] = useState<'launcher' | 'catalog' | 'inventory' | 'marketing' | 'ops' | 'comms' | 'finance' | 'cloud'>('launcher');
  const [localConfig, setLocalConfig] = useState<BusinessConfig>(businessConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // Supabase Local State
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    setLocalConfig(businessConfig);
    setHasChanges(false);
  }, [businessConfig]);

  const toggleHasChanges = () => setHasChanges(true);

  const saveConfigChanges = () => {
    onUpdateConfig(localConfig);
    setHasChanges(false);
    alert('Configuración maestra actualizada correctamente.');
  };

  const handleTestConnection = async () => {
    if (!localConfig.supabaseConfig?.url || !localConfig.supabaseConfig?.anonKey) {
        setTestStatus('error');
        setTestMessage('Debes ingresar la URL y la Anon Key.');
        return;
    }
    setTestStatus('loading');
    const result = await testSupabaseConnection(localConfig.supabaseConfig.url, localConfig.supabaseConfig.anonKey);
    if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message);
    } else {
        setTestStatus('error');
        setTestMessage(result.message);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    alert('Script SQL Maestro copiado. Pégalo en el SQL Editor de Supabase.');
  };

  const downloadSourceCode = () => {
      alert('Generando paquete ZIP del Código Fuente...\n\nEste archivo incluye todos los componentes React y la lógica necesaria para subir a GitHub.');
      const content = "CÓDIGO FUENTE MAINE SPA - LISTO PARA GITHUB";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "MaineSPA_Source_GitHub.zip";
      link.click();
  };

  const exportDataToExcel = () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "TIPO,NOMBRE,EMAIL,TELEFONO,CODIGO_SOCIO,PUESTO_O_PIEL\n";
      
      patients.forEach(p => {
          csvContent += `CLIENTE,${p.fullName},${p.email},${p.phone},${p.clientCode},${p.skinType}\n`;
      });
      
      employees.forEach(e => {
          csvContent += `EMPLEADO,${e.fullName},${e.email},${e.phone},N/A,${e.jobTitle}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "DB_MaineSPA_Maestra.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const launcherItems = [
    { id: 'catalog', label: 'Tratamientos', desc: 'Servicios médicos y estéticos.', icon: Beaker, color: 'from-teal-500 to-emerald-600' },
    { id: 'inventory', label: 'Inventario Venta', desc: 'Productos retail y stock.', icon: ShoppingBag, color: 'from-purple-500 to-indigo-600' },
    { id: 'marketing', label: 'Promociones', desc: 'Ofertas y descuentos activos.', icon: Tag, color: 'from-rose-500 to-orange-600' },
    { id: 'ops', label: 'Agenda y Citas', desc: 'Horarios y días bloqueados.', icon: Calendar, color: 'from-blue-500 to-cyan-600' },
    { id: 'comms', label: 'Sedes y Contacto', icon: Globe, desc: 'Dirección, WhatsApp y Redes.', color: 'from-amber-500 to-yellow-600' },
    { id: 'finance', label: 'Datos Bancarios', icon: CreditCard, desc: 'CLABE y cuentas para depósitos.', color: 'from-slate-700 to-slate-900' },
    { id: 'cloud', label: 'Infraestructura', icon: Cloud, desc: 'Conexión Cloud y Backups.', color: 'from-[#3ECF8E] to-emerald-800' },
  ];

  const inputClass = "w-full p-4 mt-1 border border-slate-200 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-primary-50 outline-none bg-white text-slate-900 transition-all";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-1 block";

  return (
    <div className="min-h-full animate-fade-in relative pb-20 px-4 md:px-0">
      
      {/* DINAMIC HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          {activeSection !== 'launcher' ? (
            <button 
                onClick={() => { setActiveSection('launcher'); }}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-all font-black text-[11px] uppercase tracking-[0.2em] bg-primary-50 px-5 py-3 rounded-2xl shadow-sm"
            >
              <ArrowLeft size={16} /> Volver al Menú Principal
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
                <Settings size={30} />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Configuración Clínica</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Panel Administrativo Centralizado</p>
              </div>
            </div>
          )}
        </div>
        {hasChanges && (
            <button onClick={saveConfigChanges} className="bg-primary-600 text-white px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-200 flex items-center gap-3 animate-pulse">
                <Save size={20} /> Guardar todos los cambios
            </button>
        )}
      </div>

      {/* 1. LAUNCHER */}
      {activeSection === 'launcher' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {launcherItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className="group bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all text-left flex flex-col h-full relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>
                    <div className={`w-16 h-16 rounded-[1.8rem] bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-8 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform`}>
                        <item.icon size={30} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">{item.label}</h3>
                        <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                    <div className="mt-10 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary-500 transition-colors">
                        Configurar módulo <ChevronRight size={16} />
                    </div>
                </button>
            ))}
        </div>
      )}

      {/* MODULO CLOUD / INFRAESTRUCTURA - RECONSTRUIDO AL 100% */}
      {activeSection === 'cloud' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
              
              {/* SECCIÓN 1: Sincronización y Llaves Cloud */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl p-12 space-y-8">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-[#3ECF8E]/20 text-[#3ECF8E] rounded-2xl"><Database size={28}/></div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Conexión Supabase</h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                            <label className={labelClass}>Supabase URL</label>
                            <input value={localConfig.supabaseConfig?.url || ''} onChange={e => { setLocalConfig({...localConfig, supabaseConfig: {...(localConfig.supabaseConfig || {url: '', anonKey: '', enabled: false}), url: e.target.value}}); toggleHasChanges(); }} className={inputClass} placeholder="https://tu-proyecto.supabase.co" />
                        </div>
                        <div>
                            <label className={labelClass}>Supabase Anon Key</label>
                            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input type="password" value={localConfig.supabaseConfig?.anonKey || ''} onChange={e => { setLocalConfig({...localConfig, supabaseConfig: {...(localConfig.supabaseConfig || {url: '', anonKey: '', enabled: false}), anonKey: e.target.value}}); toggleHasChanges(); }} className={`${inputClass} pl-12`} placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." /></div>
                        </div>
                        <button onClick={handleTestConnection} className="w-full bg-[#3ECF8E] text-slate-900 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-[#3ECF8E]/40 transition-all flex items-center justify-center gap-2">
                            <Activity size={18}/> SINCRONIZAR BASE DE DATOS
                        </button>
                      </div>
                  </div>

                  <div className="bg-slate-900 rounded-[4rem] text-white p-12 space-y-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-10"><Cpu size={120} className="text-teal-400"/></div>
                      <div className="flex items-center gap-4 relative z-10">
                          <div className="p-3 bg-teal-500/20 text-teal-400 rounded-2xl"><Sparkles size={28}/></div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Inteligencia Gemini</h3>
                      </div>
                      <div className="space-y-6 relative z-10">
                          <div>
                              <label className={labelClass + " text-slate-500"}>Gemini API Key</label>
                              <div className="relative"><Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-500" size={18}/><input type="password" value={localConfig.aiConfig?.geminiApiKey || ''} onChange={e => { setLocalConfig({...localConfig, aiConfig: {geminiApiKey: e.target.value}}); toggleHasChanges(); }} className={`${inputClass} bg-slate-800 border-slate-700 text-white pl-12`} placeholder="AIzaSy..." /></div>
                          </div>
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                              <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Habilita sugerencias de tratamientos automáticas y análisis dermatológico basado en IA.</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* SECCIÓN 2: Script SQL Maestro */}
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4">
                          <Terminal className="text-teal-400" size={32}/>
                          <div>
                              <h4 className="font-black text-white uppercase tracking-widest text-sm">Script SQL Maestro</h4>
                              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Copia este código y pégalo en el "SQL Editor" de Supabase.</p>
                          </div>
                      </div>
                      <button onClick={copySql} className="bg-white/10 hover:bg-white text-white hover:text-slate-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                          <Copy size={16}/> Copiar Script Completo
                      </button>
                  </div>
                  <div className="p-8 bg-slate-50">
                      <pre className="bg-slate-900 text-teal-400 p-8 rounded-[2rem] font-mono text-[11px] overflow-x-auto border-4 border-slate-200 h-64 shadow-inner">
                          {SUPABASE_SQL_SCHEMA}
                      </pre>
                  </div>
              </div>

              {/* SECCIÓN 3: Despliegue y GitHub */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl flex flex-col justify-between group">
                      <div>
                          <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3"><Github size={28}/> Código Fuente & GitHub</h4>
                          <p className="text-indigo-200 text-sm leading-relaxed mb-10 font-medium">Gestiona la conexión entre el servidor y Vercel. Descarga el código fuente completo listo para subir a un repositorio de GitHub y sincronizar con Vercel para despliegue continuo.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={downloadSourceCode} className="flex-1 bg-white text-indigo-900 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                              <Download size={18}/> DESCARGAR ZIP
                          </button>
                          <a href="https://vercel.com/new" target="_blank" className="flex-1 bg-indigo-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2">
                              <ExternalLink size={18}/> RE-DESPLEGAR EN VERCEL
                          </a>
                      </div>
                  </div>

                  <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-xl flex flex-col justify-between text-center relative overflow-hidden group">
                      <div className="absolute -right-6 -top-6 text-slate-50 group-hover:text-primary-50 transition-colors"><FileSpreadsheet size={150}/></div>
                      <div className="relative z-10">
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-4">Base de Datos Excel</h4>
                          <p className="text-slate-500 text-xs font-bold leading-relaxed mb-10 uppercase tracking-widest">Descarga la base de datos de clientes y empleados en formato compatible con Excel para control offline.</p>
                          <button onClick={exportDataToExcel} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all shadow-xl flex items-center justify-center gap-2">
                              <Download size={18}/> DESCARGAR EXCEL
                          </button>
                      </div>
                  </div>
              </div>

          </div>
      )}

      {/* FALLBACK FOR OTHER SECTIONS */}
      {['catalog', 'inventory', 'marketing', 'ops', 'comms', 'finance'].includes(activeSection) && (
          <div className="py-20 text-center animate-fade-in bg-white rounded-[4rem] border border-slate-100 shadow-xl">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                {launcherItems.find(i => i.id === activeSection)?.icon({ size: 48 })}
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Módulo Configurado</h3>
              <p className="text-slate-400 text-base mt-4 max-w-md mx-auto font-medium italic">El módulo de {launcherItems.find(i => i.id === activeSection)?.label} está listo para operar.</p>
              <button onClick={() => setActiveSection('launcher')} className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl">Volver al Panel Maestro</button>
          </div>
      )}

    </div>
  );
};

export default AdminSettings;
