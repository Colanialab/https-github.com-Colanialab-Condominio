
import React, { useState } from 'react';
import { AppState, Owner } from '../types';
import { Plus, Trash2, Edit2, UserPlus } from 'lucide-react';

interface OwnersRegistryProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const OwnersRegistry: React.FC<OwnersRegistryProps> = ({ state, updateState }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Owner, 'id'>>({
    name: '',
    unit: '',
    millesimi: 0,
    email: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state.owners.length >= 8) {
      alert("Massimo 8 unità consentite in questa versione.");
      return;
    }
    const newOwner: Owner = {
      ...formData,
      id: crypto.randomUUID()
    };
    updateState(prev => ({
      ...prev,
      owners: [...prev.owners, newOwner]
    }));
    setShowAddModal(false);
    setFormData({ name: '', unit: '', millesimi: 0, email: '', phone: '' });
  };

  const deleteOwner = (id: string) => {
    if (confirm("Sicuro di voler eliminare questo condomino? Verranno rimosse anche le scadenze associate.")) {
      updateState(prev => ({
        ...prev,
        owners: prev.owners.filter(o => o.id !== id)
      }));
    }
  };

  const totalMillesimi = state.owners.reduce((acc, curr) => acc + curr.millesimi, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Anagrafica Condomini</h2>
          <p className="text-slate-500">Gestione dei proprietari e delle quote millesimali</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Aggiungi Condomino
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">Unità</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">Proprietario</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">Millesimi</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">Contatti</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {state.owners.map(owner => (
              <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                    {owner.unit}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{owner.name}</td>
                <td className="px-6 py-4 text-slate-600">{owner.millesimi}/1000</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs">
                    <span className="text-slate-500">{owner.email}</span>
                    <span className="text-slate-400">{owner.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => deleteOwner(owner.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {state.owners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <UserPlus className="mx-auto mb-2 opacity-20" size={48} />
                  Nessun condomino registrato.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50/80 font-bold border-t border-slate-100">
            <tr>
              <td className="px-6 py-4" colSpan={2}>Totale Millesimi</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className={totalMillesimi !== 1000 ? 'text-red-600' : 'text-indigo-600'}>
                    {totalMillesimi}/1000
                  </span>
                  {totalMillesimi !== 1000 && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
                      Incompleto
                    </span>
                  )}
                </div>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Nuovo Condomino</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome e Cognome</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unità (es. Int 1)</label>
                  <input 
                    required
                    type="text" 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Millesimi</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.millesimi}
                    onChange={e => setFormData({...formData, millesimi: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefono</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-slate-600 font-medium bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-white font-medium bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnersRegistry;
