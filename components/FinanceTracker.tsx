
import React, { useState } from 'react';
import { AppState, Payment } from '../types';
import { Plus, Download, Filter } from 'lucide-react';

interface FinanceTrackerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const FinanceTracker: React.FC<FinanceTrackerProps> = ({ state, updateState }) => {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<Omit<Payment, 'id'>>({
    ownerId: state.owners[0]?.id || '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'Quota',
    description: 'Versamento quota ordinaria'
  });

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.ownerId) return;
    const newPayment: Payment = {
      ...paymentData,
      id: crypto.randomUUID()
    };
    updateState(prev => ({
      ...prev,
      payments: [...prev.payments, newPayment]
    }));
    setShowAddPaymentModal(false);
  };

  const handleExportCSV = () => {
    if (state.payments.length === 0) {
      alert("Nessun versamento da esportare.");
      return;
    }

    const headers = ["Data", "Condomino", "Descrizione", "Tipo", "Importo"];
    const rows = state.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => {
      const owner = state.owners.find(o => o.id === payment.ownerId);
      return [
        new Date(payment.date).toLocaleDateString(),
        owner?.name || 'Sconosciuto',
        payment.description,
        payment.type,
        payment.amount.toFixed(2).replace('.', ',') // Format for Excel (Italian)
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `versamenti_${state.settings.condoName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCapital = state.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalOut = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cassa e Versamenti</h2>
          <p className="text-slate-500">Monitoraggio del capitale e flussi di cassa</p>
        </div>
        <button 
          onClick={() => setShowAddPaymentModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-lg"
        >
          <Plus size={20} />
          Registra Versamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
          <p className="text-indigo-100 text-sm">Capitale Versato</p>
          <p className="text-3xl font-bold">€{totalCapital.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-sm">Totale Uscite</p>
          <p className="text-3xl font-bold text-red-500">€{totalOut.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-500 text-sm">Saldo Attuale</p>
          <p className={`text-3xl font-bold ${totalCapital - totalOut >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            €{(totalCapital - totalOut).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Cronologia Versamenti</h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Filter size={20} />
            </button>
            <button 
              onClick={handleExportCSV}
              title="Esporta CSV"
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-bold">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Condomino</th>
                <th className="px-6 py-4">Descrizione</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-right">Importo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(payment => {
                const owner = state.owners.find(o => o.id === payment.ownerId);
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{owner?.name || 'Sconosciuto'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{payment.description}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        payment.type === 'Quota' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">€{payment.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
              {state.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Nessun versamento registrato.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Registra Versamento</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condomino</label>
                <select 
                  required
                  value={paymentData.ownerId}
                  onChange={e => setPaymentData({...paymentData, ownerId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleziona...</option>
                  {state.owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.unit})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Importo (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={paymentData.amount}
                    onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input 
                    required
                    type="date" 
                    value={paymentData.date}
                    onChange={e => setPaymentData({...paymentData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
                <input 
                  type="text" 
                  value={paymentData.description}
                  onChange={e => setPaymentData({...paymentData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddPaymentModal(false)} className="flex-1 py-2 bg-slate-100 rounded-xl">Annulla</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl shadow-lg">Registra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;
