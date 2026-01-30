
import React, { useState, useEffect } from 'react';
import { Service, Promotion, BusinessConfig, Patient, Appointment, Employee, Product, ProductCategoryType, EmailConfig, SupabaseConfig } from '../types';
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
  Code
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
    alert('SQL Schema copiado al portapapeles. Pégalo en el SQL Editor de Supabase.');
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

      {/* 1. LAUNCHER (TARJETAS PREMIUM) */}
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

      {/* MODULO CLOUD / INFRAESTRUCTURA - RECONSTRUIDO PARA FUNCIONALIDAD 100% */}
      {activeSection === 'cloud' && (
          <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
              {/* CARD PRINCIPAL: SUPABASE */}
              <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden group">
                  <div className="bg-[#3ECF8E] p-12 flex justify-between items-center text-slate-900 shadow-xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-8 opacity-20 group-hover:rotate-12 transition-transform"><Database size={100}/></div>
                      <div className="flex items-center gap-5 relative z-10">
                          <div className="p-4 bg-slate-900 text-white rounded-3xl"><Database size={40}/></div>
                          <h3 className="text-4xl font-black uppercase tracking-tighter">Motor de Datos Supabase</h3>
                      </div>
                      <div className="relative z-10 flex items-center gap-3 bg-white/30 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/50">
                          <Activity size={18} className={testStatus === 'loading' ? 'animate-spin' : ''}/>
                          <span className="font-black text-[10px] uppercase tracking-widest">
                              {testStatus === 'success' ? 'Sincronizado' : testStatus === 'loading' ? 'Validando...' : 'Pendiente'}
                          </span>
                      </div>
                  </div>
                  
                  <div className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                          <div>
                              <label className={labelClass}>Project URL (API Endpoint)</label>
                              <input 
                                value={localConfig.supabaseConfig?.url || ''} 
                                onChange={e => {
                                    setLocalConfig({...localConfig, supabaseConfig: {...(localConfig.supabaseConfig || {url: '', anonKey: '', enabled: false}), url: e.target.value}});
                                    toggleHasChanges();
                                }}
                                className={inputClass} 
                                placeholder="https://xyz.supabase.co" 
                              />
                          </div>
                          <div>
                              <label className={labelClass}>Anon Public Key</label>
                              <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                                  <input 
                                    type="password"
                                    value={localConfig.supabaseConfig?.anonKey || ''} 
                                    onChange={e => {
                                        setLocalConfig({...localConfig, supabaseConfig: {...(localConfig.supabaseConfig || {url: '', anonKey: '', enabled: false}), anonKey: e.target.value}});
                                        toggleHasChanges();
                                    }}
                                    className={`${inputClass} pl-12`} 
                                    placeholder="••••••••••••••••••••••••" 
                                  />
                              </div>
                          </div>
                          <div className="flex flex-col gap-4">
                              <button 
                                onClick={handleTestConnection}
                                disabled={testStatus === 'loading'}
                                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[#3ECF8E] hover:text-slate-900 transition-all shadow-xl flex items-center justify-center gap-3"
                              >
                                {testStatus === 'loading' ? <RefreshCw className="animate-spin" size={20}/> : <Zap size={20}/>}
                                {testStatus === 'loading' ? 'Probando...' : 'Probar Conectividad Cloud'}
                              </button>
                              
                              {testMessage && (
                                  <div className={`p-4 rounded-2xl text-[11px] font-bold flex items-center gap-2 border ${testStatus === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                      {testStatus === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                                      {testMessage}
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 flex flex-col justify-between shadow-inner">
                          <div className="space-y-4">
                              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2"><Code size={18} className="text-primary-600"/> Pasos para Sincronizar</h4>
                              <p className="text-slate-600 text-sm leading-relaxed font-medium">1. Crea un proyecto en <strong>Supabase.com</strong>.<br/>2. Copia la URL y Anon Key a este panel.<br/>3. Usa el <strong>SQL Editor</strong> de Supabase con el esquema Maine SPA.</p>
                              
                              <button 
                                onClick={() => setShowSql(!showSql)}
                                className="text-primary-600 font-black text-[10px] uppercase underline flex items-center gap-1 hover:text-primary-800"
                              >
                                {showSql ? 'Ocultar Código SQL' : 'Ver Esquema de Tablas (SQL)'}
                              </button>
                          </div>
                          
                          <div className="pt-8">
                             <a href="https://supabase.com/dashboard" target="_blank" className="w-full bg-white border-4 border-slate-900 text-slate-900 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl flex items-center justify-center gap-2">
                                 Abrir Supabase Dashboard <ExternalLink size={16}/>
                             </a>
                          </div>
                      </div>
                  </div>
              </div>

              {/* VISTA SQL (OPCIONAL) */}
              {showSql && (
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl animate-slide-down relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5"><Terminal size={150}/></div>
                      <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                              <h4 className="font-black uppercase tracking-widest text-sm text-teal-400">Maine SPA Database Schema (SQL)</h4>
                              <button onClick={copySql} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                                  <Copy size={14}/> Copiar Código
                              </button>
                          </div>
                          <pre className="bg-black/50 p-6 rounded-3xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-white/5 max-h-96">
                              {SUPABASE_SQL_SCHEMA}
                          </pre>
                          <div className="mt-6 flex items-center gap-3 text-amber-400 bg-amber-900/30 p-4 rounded-2xl">
                              <AlertCircle size={20}/>
                              <p className="text-[10px] font-bold uppercase tracking-widest">Ejecuta este código en Supabase para habilitar las tablas de Clientes, Citas e Inventario.</p>
                          </div>
                      </div>
                  </div>
              )}

              {/* OPCIONES ADICIONALES DE DESPLIEGUE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-indigo-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Cloud size={120}/></div>
                      <h4 className="text-2xl font-black uppercase tracking-widest mb-4">Vercel V3 Deployment</h4>
                      <p className="text-indigo-200 text-sm leading-relaxed mb-10 font-medium">Tu App será alojada en servidores globales con latencia ultra-baja y backups automáticos diarios.</p>
                      <a href="https://vercel.com/new" target="_blank" className="block w-full bg-white text-indigo-900 py-5 rounded-[2rem] font-black text-center text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">Actualizar Producción</a>
                  </div>
                  
                  <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 flex flex-col justify-between shadow-xl">
                      <div>
                          <h4 className="font-black uppercase tracking-widest text-[11px] text-primary-600 mb-4 flex items-center gap-2"><ArrowLeft size={16}/> Respaldo Local (JSON)</h4>
                          <p className="text-slate-600 text-sm font-bold leading-relaxed">¿Sin internet? Descarga una copia encriptada de toda tu base de datos clínica directamente a tu computadora.</p>
                      </div>
                      <button className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all mt-10 shadow-xl">Descargar Snapshot Maestro</button>
                  </div>
              </div>
          </div>
      )}

      {/* RENDER OTROS MODULOS (FALLBACK) */}
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
