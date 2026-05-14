
import React, { useState } from 'react';
import { AppState, Expense, TaxPayment } from '../types';
import { Landmark, FileText, CheckCircle, Clock, AlertTriangle, Download, Plus, History } from 'lucide-react';

interface TaxManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const TaxManager: React.FC<TaxManagerProps> = ({ state, updateState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'f24' | 'cu'>('f24');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const pendingWithholdings = state.expenses.filter(ex => 
    ex.withholdingAmount && ex.withholdingAmount > 0 && !ex.withholdingPaid
  );

  const handlePayTax = (expense: Expense) => {
    const taxPayment: TaxPayment = {
      id: crypto.randomUUID(),
      expenseId: expense.id,
      taxCode: expense.category === 'Amministrazione' ? '1040' : '1019',
      amount: expense.withholdingAmount || 0,
      paymentDate: new Date().toISOString().split('T')[0],
      period: `${new Date().getMonth() + 1}/${new Date().getFullYear()}`
    };

    updateState(prev => ({
      ...prev,
      taxPayments: [...(prev.taxPayments || []), taxPayment],
      expenses: prev.expenses.map(ex => ex.id === expense.id ? { ...ex, withholdingPaid: true } : ex)
    }));
  };

  // Raggruppa per fornitore per la CU
  const getSupplierSummary = () => {
    const summary: Record<string, { total: number, withholding: number, vat: string }> = {};
    
    state.expenses
      .filter(ex => new Date(ex.date).getFullYear() === selectedYear)
      .forEach(ex => {
        const name = ex.supplierName || 'Fornitore Generico';
        if (!summary[name]) {
          summary[name] = { total: 0, withholding: 0, vat: ex.supplierVat || '---' };
        }
        summary[name].total += ex.amount;
        summary[name].withholding += (ex.withholdingAmount || 0);
      });
    
    return Object.entries(summary);
  };

  // Mostra tutti i versamenti ordinati per data decrescente
  const allTaxPayments = (state.taxPayments || [])
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Adempimenti Fiscali</h2>
          <p className="text-slate-500">Gestione Ritenute d'Acconto e Certificazioni Annuali</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveSubTab('f24')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'f24' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Modello F24
          </button>
          <button 
            onClick={() => setActiveSubTab('cu')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'cu' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Certificazione Unica
          </button>
        </div>
      </div>

      {activeSubTab === 'f24' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Da Versare */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="text-amber-500" size={20} />
              Ritenute da Versare
            </h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Fornitore / Spesa</th>
                    <th className="px-6 py-4">Cod. Tributo</th>
                    <th className="px-6 py-4">Importo</th>
                    <th className="px-6 py-4 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingWithholdings.map(ex => (
                    <tr key={ex.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{ex.supplierName || 'Fornitore'}</p>
                        <p className="text-xs text-slate-500">{ex.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded font-mono text-xs font-bold">
                          {ex.category === 'Amministrazione' ? '1040' : '1019'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-amber-600">
                        €{ex.withholdingAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handlePayTax(ex)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                        >
                          Versato (F24)
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pendingWithholdings.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                        Tutte le ritenute sono state versate. Ottimo lavoro!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Storico Versamenti F24 Completo */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <History className="text-indigo-500" size={20} />
              Storico Versamenti F24
            </h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Data Pagamento</th>
                      <th className="px-6 py-4">Codice Tributo</th>
                      <th className="px-6 py-4">Periodo</th>
                      <th className="px-6 py-4 text-right">Importo Versato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allTaxPayments.map(tp => (
                      <tr key={tp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {new Date(tp.paymentDate).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-mono text-xs font-bold border border-indigo-100">
                            {tp.taxCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {tp.period}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-green-600">
                          €{tp.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    {allTaxPayments.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                          Nessun versamento F24 registrato finora.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="text-indigo-600" size={32} />
              <div>
                <h3 className="text-xl font-bold text-slate-800">Riepilogo Certificazione Unica {selectedYear}</h3>
                <p className="text-sm text-slate-500">Dati aggregati per la dichiarazione dei sostituti d'imposta</p>
              </div>
            </div>
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getSupplierSummary().map(([name, data]) => (
              <div key={name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{name}</h4>
                    <p className="text-xs text-slate-500 font-mono">P.IVA/CF: {data.vat}</p>
                  </div>
                  <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Esporta PDF">
                    <Download size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Totale Compensi</p>
                    <p className="text-lg font-bold text-slate-800">€{data.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Ritenute Totali</p>
                    <p className="text-lg font-bold text-indigo-600">€{data.withholding.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            {getSupplierSummary().length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic">
                Nessuna operazione fiscale registrata per l'anno {selectedYear}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxManager;
