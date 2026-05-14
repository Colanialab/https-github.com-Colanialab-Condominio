
import React, { useState } from 'react';
import { AppState, Expense } from '../types';
import { Plus, Calculator, CheckCircle, XCircle, AlertTriangle, Clock, Landmark } from 'lucide-react';

interface ExpensesManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ExpensesManager: React.FC<ExpensesManagerProps> = ({ state, updateState }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'estimate'>('list');
  const [selectedExpenseForEstimate, setSelectedExpenseForEstimate] = useState<Expense | null>(null);

  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    description: '',
    category: 'Manutenzione',
    amount: 0,
    withholdingAmount: 0,
    netAmount: 0,
    supplierName: '',
    supplierVat: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    paid: false,
    withholdingPaid: false,
    divisionType: 'Millesimi'
  });

  const handleAmountChange = (val: number) => {
    // Calcolo automatico ritenuta se è una categoria specifica
    // 4% per ditte (default manutenzione), 20% per professionisti (es. Amministrazione)
    let withholding = 0;
    if (formData.category === 'Amministrazione') {
      withholding = val * 0.20;
    } else if (['Manutenzione', 'Pulizie', 'Giardinaggio'].includes(formData.category)) {
      withholding = val * 0.04;
    }
    
    setFormData({
      ...formData, 
      amount: val, 
      withholdingAmount: Number(withholding.toFixed(2)),
      netAmount: Number((val - withholding).toFixed(2))
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      ...formData,
      id: crypto.randomUUID()
    };
    updateState(prev => ({
      ...prev,
      expenses: [...prev.expenses, newExpense]
    }));
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      category: 'Manutenzione',
      amount: 0,
      withholdingAmount: 0,
      netAmount: 0,
      supplierName: '',
      supplierVat: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      paid: false,
      withholdingPaid: false,
      divisionType: 'Millesimi'
    });
  };

  const togglePaid = (id: string) => {
    updateState(prev => ({
      ...prev,
      expenses: prev.expenses.map(ex => ex.id === id ? { ...ex, paid: !ex.paid } : ex)
    }));
  };

  const calculateDivision = (expense: Expense) => {
    return state.owners.map(owner => ({
      owner: owner.name,
      unit: owner.unit,
      share: (expense.amount * owner.millesimi) / 1000,
      millesimi: owner.millesimi
    }));
  };

  const getExpenseStatus = (expense: Expense) => {
    if (expense.paid) return { label: 'Pagata', color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> };
    const today = new Date().toISOString().split('T')[0];
    if (expense.dueDate && expense.dueDate < today) {
      return { label: 'Scaduta', color: 'bg-red-100 text-red-700 animate-pulse', icon: <AlertTriangle size={14} /> };
    }
    return { label: 'In attesa', color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Spese e Preventivi</h2>
          <p className="text-slate-500">Registra i costi e calcola la divisione millesimale</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setActiveTab('list'); setSelectedExpenseForEstimate(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Lista Spese
          </button>
          <button 
            onClick={() => setActiveTab('estimate')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'estimate' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Preventivi / Divisione
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 ml-2"
          >
            <Plus size={20} />
            Nuova Spesa
          </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">Data Reg.</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">Descrizione / Fornitore</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">Scadenza</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">Importo / Rit.</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500">Stato</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => {
                const status = getExpenseStatus(expense);
                return (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <span>{expense.category}</span>
                        {expense.supplierName && (
                          <>
                            <span className="text-slate-200">|</span>
                            <span>{expense.supplierName}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {expense.dueDate ? (
                        <span className={!expense.paid && expense.dueDate < new Date().toISOString().split('T')[0] ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {new Date(expense.dueDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic">Non imp.</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">€{expense.amount.toFixed(2)}</p>
                      {expense.withholdingAmount ? (
                        <p className={`text-[10px] font-bold ${expense.withholdingPaid ? 'text-green-600' : 'text-amber-600'}`}>
                          Rit: €{expense.withholdingAmount.toFixed(2)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePaid(expense.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all hover:scale-105 ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedExpenseForEstimate(expense); setActiveTab('estimate'); }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 ml-auto"
                      >
                        <Calculator size={14} />
                        Ripartizione
                      </button>
                    </td>
                  </tr>
                );
              })}
              {state.expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nessuna spesa registrata.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Seleziona Spesa</h3>
            <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
              {state.expenses.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExpenseForEstimate(ex)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedExpenseForEstimate?.id === ex.id 
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-900 line-clamp-1">{ex.description}</p>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-indigo-600 font-bold">€{ex.amount.toFixed(2)}</span>
                    <span className="text-slate-400 italic">{ex.category}</span>
                  </div>
                </button>
              ))}
              {state.expenses.length === 0 && <p className="text-slate-400 text-center py-4">Crea una spesa prima.</p>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            {selectedExpenseForEstimate ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedExpenseForEstimate.description}</h3>
                    <p className="text-slate-500">Ripartizione Millesimale - Importo: <span className="text-slate-900 font-bold">€{selectedExpenseForEstimate.amount.toFixed(2)}</span></p>
                  </div>
                  <Calculator className="text-indigo-400" size={32} />
                </div>
                
                <div className="space-y-3">
                  {calculateDivision(selectedExpenseForEstimate).map((div, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{div.owner}</p>
                        <p className="text-xs text-slate-500">{div.unit} ({div.millesimi} mill.)</p>
                      </div>
                      <p className="text-lg font-bold text-indigo-600">€{div.share.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="text-xs text-slate-400 italic">
                    Calcolato sulla base di 1000/1000 millesimi totali.
                  </div>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200">
                    Esporta Preventivo PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                <Calculator size={48} className="opacity-20" />
                <p>Seleziona una spesa per vederne la ripartizione tra i condomini</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Registra Nuova Spesa</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione Spesa</label>
                  <input 
                    required
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="es. Riparazione Citofono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => {
                      const newCat = e.target.value;
                      setFormData(prev => ({...prev, category: newCat}));
                      handleAmountChange(formData.amount); // Ricalcola ritenuta se cambia categoria
                    }}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option>Manutenzione</option>
                    <option>Utenze</option>
                    <option>Assicurazione</option>
                    <option>Pulizie</option>
                    <option>Giardinaggio</option>
                    <option>Amministrazione</option>
                    <option>Varie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fornitore (Nome/Ragione Soc.)</label>
                  <input 
                    type="text" 
                    value={formData.supplierName}
                    onChange={e => setFormData({...formData, supplierName: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Nome ditta o professionista"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">P.IVA / Codice Fiscale Fornitore</label>
                  <input 
                    type="text" 
                    value={formData.supplierVat}
                    onChange={e => setFormData({...formData, supplierVat: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="11 cifre o CF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Importo Lordo (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={e => handleAmountChange(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Sezione Fiscale Dinamica */}
              {(formData.withholdingAmount || 0) > 0 && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Landmark className="text-indigo-600" size={24} />
                    <div>
                      <p className="text-xs font-black uppercase text-indigo-400">Dati Fiscali (Scorporo)</p>
                      <p className="text-sm text-indigo-900 font-bold">Ritenuta: €{formData.withholdingAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 font-bold uppercase">Netto a Pagare</p>
                    <p className="text-lg font-black text-indigo-600">€{formData.netAmount?.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Documento</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Scadenza Pagam.</label>
                  <input 
                    type="date" 
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="paid"
                  checked={formData.paid}
                  onChange={e => setFormData({...formData, paid: e.target.checked})}
                  className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="paid" className="text-sm font-bold text-slate-700">Contrassegna come già pagata</label>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
                >
                  Salva Spesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManager;
