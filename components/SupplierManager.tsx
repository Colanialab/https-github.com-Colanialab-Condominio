
import React, { useState } from 'react';
import { AppState, Supplier } from '../types';
import { 
  Truck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  Building2,
  Tag,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard
} from 'lucide-react';

interface SupplierManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    category: '',
    email: '',
    phone: '',
    vatNumber: '',
    notes: ''
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;

    if (editingSupplier) {
      updateState(prev => ({
        ...prev,
        suppliers: (prev.suppliers || []).map(s => 
          s.id === editingSupplier.id ? { ...s, ...formData } as Supplier : s
        )
      }));
      setShowSuccess('Fornitore aggiornato con successo!');
    } else {
      const newSupplier: Supplier = {
        id: crypto.randomUUID(),
        name: formData.name!,
        category: formData.category || 'Generico',
        email: formData.email || '',
        phone: formData.phone || '',
        vatNumber: formData.vatNumber,
        notes: formData.notes
      };
      updateState(prev => ({
        ...prev,
        suppliers: [...(prev.suppliers || []), newSupplier]
      }));
      setShowSuccess('Nuovo fornitore censito!');
    }

    setShowModal(false);
    setEditingSupplier(null);
    setFormData({ name: '', category: '', email: '', phone: '', vatNumber: '', notes: '' });
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      updateState(prev => ({
        ...prev,
        suppliers: (prev.suppliers || []).filter(s => s.id !== id)
      }));
    }
  };

  const filteredSuppliers = (state.suppliers || [])
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const categories = Array.from(new Set((state.suppliers || []).map(s => s.category)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Anagrafica Fornitori</h2>
          <p className="text-slate-500">Gestione centralizzata delle ditte e dei prestatori d'opera</p>
        </div>
        <button 
          onClick={() => { setEditingSupplier(null); setFormData({}); setShowModal(true); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 font-bold transition-all"
        >
          <Plus size={20} />
          Nuovo Fornitore
        </button>
      </div>

      {showSuccess && (
        <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-lg">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">{showSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Tag size={16} className="text-indigo-500" />
              Categorie
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSearchTerm('')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex justify-between items-center"
              >
                <span>Tutti</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{(state.suppliers || []).length}</span>
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSearchTerm(cat)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex justify-between items-center"
                >
                  <span className="truncate">{cat}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">
                    {(state.suppliers || []).filter(s => s.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Cerca per nome, categoria o P.IVA..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(supplier => (
              <div key={supplier.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
                    <Truck size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(supplier.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{supplier.name}</h4>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase">
                    <Tag size={10} />
                    {supplier.category}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {supplier.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Mail size={14} />
                      </div>
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <Phone size={14} />
                      </div>
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.vatNumber && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <CreditCard size={14} />
                      </div>
                      <span className="font-mono text-xs">P.IVA {supplier.vatNumber}</span>
                    </div>
                  )}
                </div>

                {supplier.notes && (
                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p className="text-xs text-amber-700 italic flex items-center gap-2">
                       <AlertCircle size={12} />
                       {supplier.notes}
                    </p>
                  </div>
                )}

                <button className="w-full py-3 bg-slate-50 text-slate-600 text-[10px] font-black uppercase rounded-2xl hover:bg-slate-100 transition-colors tracking-widest">
                  Visualizza Storico Lavori
                </button>
              </div>
            ))}

            {filteredSuppliers.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Truck size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium italic">Nessun fornitore trovato per questa ricerca.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in fade-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">
                    {editingSupplier ? 'Modifica Fornitore' : 'Nuovo Fornitore'}
                  </h3>
                  <p className="text-xs text-slate-500">Compila tutti i dettagli per la fatturazione</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-slate-200 rounded-2xl text-slate-400 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Ragione Sociale <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800"
                      placeholder="es. Edilizia Moderna S.r.l."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Categoria</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="es. Idraulica"
                    list="cat-list"
                  />
                  <datalist id="cat-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Partita IVA</label>
                  <input 
                    type="text" 
                    value={formData.vatNumber}
                    onChange={e => setFormData({ ...formData, vatNumber: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="IT01234567890"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Email di Contatto</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="info@fornitore.it"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Telefono / Cellulare</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="+39 012..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Note Aggiuntive</label>
                  <textarea 
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder="es. Convenzionato per interventi d'urgenza..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-slate-500 font-black text-xs uppercase tracking-widest bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-4 text-white font-black text-xs uppercase tracking-widest bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  {editingSupplier ? 'Salva Modifiche' : 'Conferma Registrazione'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;
