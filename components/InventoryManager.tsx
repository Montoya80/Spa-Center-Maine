
import React, { useState } from 'react';
import { Product, InventoryTransaction, Employee, Patient, ProductCategoryType } from '../types';
import { 
    Package, 
    Plus, 
    Minus, 
    Search, 
    User, 
    ArrowUpRight, 
    ArrowDownLeft, 
    AlertTriangle, 
    Beaker, 
    ShoppingBag,
    X,
    Image as ImageIcon,
    Filter,
    Layers,
    FileText,
    History
} from 'lucide-react';

interface InventoryManagerProps {
    products: Product[];
    transactions: InventoryTransaction[];
    employees: Employee[];
    patients: Patient[];
    onUpdateProduct: (product: Product) => void;
    onAddProduct: (product: Product) => void;
    onAddTransaction: (transaction: InventoryTransaction) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
    products, 
    transactions, 
    employees, 
    patients,
    onUpdateProduct,
    onAddProduct,
    onAddTransaction
}) => {
    const [view, setView] = useState<'stock' | 'history'>('stock');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'retail' | 'professional'>('all');
    
    // Modals
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    
    // New Product State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newStock, setNewStock] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newType, setNewType] = useState<ProductCategoryType>('professional');
    const [newDesc, setNewDesc] = useState('');
    const [newImg, setNewImg] = useState<string | null>(null);

    // Adjustment State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [adjustmentQty, setAdjustmentQty] = useState(1);
    const [adjustmentType, setAdjustmentType] = useState<'restock' | 'consumption' | 'adjustment'>('restock');
    const [adjustmentEmp, setAdjustmentEmp] = useState('');
    const [adjustmentPat, setAdjustmentPat] = useState('');
    const [adjustmentNotes, setAdjustmentNotes] = useState('');

    const filteredProducts = products.filter(p => 
        (filterType === 'all' || p.categoryType === filterType) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => a.stock - b.stock);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setNewImg(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCreateProduct = (e: React.FormEvent) => {
        e.preventDefault();
        const product: Product = {
            id: `prod-${Date.now()}`,
            name: newName,
            price: parseFloat(newPrice) || 0,
            stock: parseInt(newStock) || 0,
            active: true,
            category: newCategory,
            categoryType: newType,
            description: newDesc,
            imageUrl: newImg || undefined
        };
        onAddProduct(product);
        setShowNewProductModal(false);
        setNewName(''); setNewPrice(''); setNewStock(''); setNewCategory(''); setNewDesc(''); setNewImg(null);
    };

    const handleAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !adjustmentEmp) {
            alert("Selecciona un responsable del movimiento.");
            return;
        }

        const qty = Math.abs(adjustmentQty);
        let newStockCount = selectedProduct.stock;
        
        if (adjustmentType === 'restock') newStockCount += qty;
        else if (adjustmentType === 'consumption') newStockCount = Math.max(0, newStockCount - qty);
        else newStockCount += adjustmentQty; // Direct adjustment can be + or -

        const employee = employees.find(e => e.id === adjustmentEmp);
        const patient = patients.find(p => p.id === adjustmentPat);

        const transaction: InventoryTransaction = {
            id: `tr-${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: qty,
            type: adjustmentType === 'adjustment' ? 'adjustment' : (adjustmentType === 'restock' ? 'restock' : 'consumption'),
            date: new Date().toISOString().split('T')[0],
            employeeId: adjustmentEmp,
            employeeName: employee?.fullName || 'Desconocido',
            patientId: adjustmentPat || undefined,
            patientName: patient?.fullName || undefined,
            notes: adjustmentNotes
        };

        onUpdateProduct({ ...selectedProduct, stock: newStockCount });
        onAddTransaction(transaction);
        setShowAdjustmentModal(false);
        setSelectedProduct(null);
        setAdjustmentQty(1);
        setAdjustmentNotes('');
        setAdjustmentEmp('');
        setAdjustmentPat('');
    };

    const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm";

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Package className="text-primary-600" /> Almacén e Inventario
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Control total de insumos profesionales y stock de venta.</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex flex-1 md:flex-none">
                        <button 
                            onClick={() => setView('stock')}
                            className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'stock' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Existencias
                        </button>
                        <button 
                            onClick={() => setView('history')}
                            className={`flex-1 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Historial
                        </button>
                    </div>
                    {view === 'stock' && (
                        <button 
                            onClick={() => setShowNewProductModal(true)}
                            className="bg-primary-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-100 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} /> Nuevo Item
                        </button>
                    )}
                </div>
            </div>

            {view === 'stock' ? (
                <>
                    <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o categoría..." 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {[
                                { id: 'all', label: 'Todos', icon: Layers },
                                { id: 'professional', label: 'Insumos', icon: Beaker },
                                { id: 'retail', label: 'Venta', icon: ShoppingBag }
                            ].map(btn => (
                                <button 
                                    key={btn.id}
                                    onClick={() => setFilterType(btn.id as any)}
                                    className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 whitespace-nowrap ${filterType === btn.id ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <btn.icon size={14} /> {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            const isLow = product.stock <= 5;
                            const isCritical = product.stock <= 2;
                            
                            return (
                                <div key={product.id} className={`bg-white rounded-[2.5rem] p-6 border transition-all relative overflow-hidden group ${isCritical ? 'border-red-200 bg-red-50/10' : 'border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl'}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-2xl ${product.categoryType === 'retail' ? 'bg-purple-50 text-purple-600' : 'bg-primary-50 text-primary-600'}`}>
                                            {product.categoryType === 'retail' ? <ShoppingBag size={24} /> : <Beaker size={24} />}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCritical ? 'bg-red-500 text-white animate-pulse' : isLow ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-700'}`}>
                                            {isCritical ? 'CRÍTICO' : isLow ? 'BAJO' : 'ÓPTIMO'}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3rem]">{product.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter">{product.category || 'Sin Cat.'}</span>
                                            {product.price > 0 && <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter">${product.price}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between border-t border-slate-50 pt-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Almacén</p>
                                            <p className={`text-3xl font-black font-mono ${isCritical ? 'text-red-600' : 'text-slate-900'}`}>{product.stock}</p>
                                        </div>
                                        <button 
                                            onClick={() => { setSelectedProduct(product); setShowAdjustmentModal(true); }}
                                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
                                        >
                                            <History size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-6">Fecha / Movimiento</th>
                                    <th className="p-6">Especialista (Responsable)</th>
                                    <th className="p-6">Destino (Paciente)</th>
                                    <th className="p-6">Cantidad</th>
                                    <th className="p-6">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tr => (
                                    <tr key={tr.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-6">
                                            <p className="text-slate-400 text-xs font-mono mb-1">{tr.date}</p>
                                            <p className="text-slate-900 font-bold">{tr.productName}</p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 mt-1 ${
                                                tr.type === 'consumption' ? 'bg-red-50 text-red-600' : 
                                                tr.type === 'restock' ? 'bg-green-50 text-green-600' : 
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                                {tr.type === 'consumption' ? <ArrowDownLeft size={10}/> : <ArrowUpRight size={10}/>}
                                                {tr.type === 'consumption' ? 'Consumo' : tr.type === 'restock' ? 'Entrada' : 'Ajuste'}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><User size={14}/></div>
                                                <span className="text-sm text-slate-700 font-bold">{tr.employeeName}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {tr.patientName ? (
                                                <span className="bg-primary-50 text-primary-700 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-primary-100">{tr.patientName}</span>
                                            ) : (
                                                <span className="text-slate-300 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="p-6 font-mono text-lg font-black text-slate-900">
                                            {tr.type === 'consumption' ? '-' : '+'}{tr.quantity}
                                        </td>
                                        <td className="p-6 max-w-xs text-xs text-slate-500 italic truncate">
                                            {tr.notes || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {transactions.length === 0 && (
                            <div className="p-20 text-center text-slate-300">
                                <History size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-black uppercase tracking-widest text-xs">No hay movimientos registrados.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showNewProductModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-down flex flex-col max-h-[90vh]">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500 rounded-2xl"><Plus size={20} /></div>
                                <h3 className="font-bold text-xl uppercase tracking-widest">Dar de alta Item</h3>
                            </div>
                            <button onClick={() => setShowNewProductModal(false)} className="hover:bg-slate-700 p-2 rounded-full"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleCreateProduct} className="p-8 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="h-48 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                                        {newImg ? <img src={newImg} className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto mb-2" /><span className="text-[10px] font-black uppercase">Subir Foto</span></div>}
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Tipo de Stock</label><select value={newType} onChange={e => setNewType(e.target.value as any)} className={inputClass}><option value="professional">🧴 Insumo Profesional (Uso Interno)</option><option value="retail">🏪 Producto Retail (Venta)</option></select></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Nombre</label><input required value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} placeholder="Ej: Botox 100U, Serum..." /></div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Categoría</label><input value={newCategory} onChange={e => setNewCategory(e.target.value)} className={inputClass} placeholder="Ej: Inyectables, Facial..." /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Precio Unitario</label><input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className={inputClass} placeholder="0.00" /></div>
                                        <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Stock Inicial</label><input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} className={inputClass} placeholder="0" /></div>
                                    </div>
                                </div>
                            </div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Descripción corta</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className={`${inputClass} h-24 resize-none`} /></div>
                            
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowNewProductModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl">GUARDAR EN ALMACÉN</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAdjustmentModal && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-down">
                        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-black text-lg uppercase tracking-widest">Registrar Movimiento</h3>
                                <p className="text-slate-400 text-xs truncate max-w-[250px]">{selectedProduct.name}</p>
                            </div>
                            <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleAdjustment} className="p-8 space-y-5">
                            <div className="flex p-1 bg-slate-100 rounded-2xl">
                                <button 
                                    type="button"
                                    onClick={() => setAdjustmentType('restock')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${adjustmentType === 'restock' ? 'bg-white text-green-600 shadow-md' : 'text-slate-400'}`}
                                >
                                    + Entrada
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setAdjustmentType('consumption')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${adjustmentType === 'consumption' ? 'bg-white text-red-600 shadow-md' : 'text-slate-400'}`}
                                >
                                    - Consumo
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setAdjustmentType('adjustment')}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${adjustmentType === 'adjustment' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}
                                >
                                    Ajuste
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Cantidad</label><input type="number" required value={adjustmentQty} onChange={e => setAdjustmentQty(parseInt(e.target.value) || 0)} className={inputClass} min="1" /></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Responsable</label><select required value={adjustmentEmp} onChange={e => setAdjustmentEmp(e.target.value)} className={inputClass}><option value="">Elegir...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}</select></div>
                            </div>

                            {adjustmentType === 'consumption' && (
                                <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Paciente (Destino)</label><select value={adjustmentPat} onChange={e => setAdjustmentPat(e.target.value)} className={inputClass}><option value="">Opcional: Vincular a Paciente...</option>{patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.clientCode})</option>)}</select></div>
                            )}

                            <div><label className="text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Comentarios / Notas</label><textarea value={adjustmentNotes} onChange={e => setAdjustmentNotes(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Motivo del movimiento..." /></div>

                            <button 
                                type="submit"
                                className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs mt-4 ${adjustmentType === 'restock' ? 'bg-green-600' : (adjustmentType === 'consumption' ? 'bg-red-600' : 'bg-slate-900')}`}
                            >
                                PROCESAR MOVIMIENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
