
import React, { useState } from 'react';
import { AppState, ExternalInteraction, Supplier, InsurancePolicy } from '../types';
import { 
  Truck, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MessageSquare, 
  History, 
  Plus, 
  AlertCircle,
  Building2,
  Calendar,
  Search,
  ChevronRight,
  MoreVertical,
  Activity,
  FileText,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface ExternalContactsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

type TabType = 'interactions' | 'insurance';

const ExternalContacts: React.FC<ExternalContactsProps> = ({ state, updateState }) => {
  const [activeTab, setActiveTab] = useState<TabType>('interactions');
  const [showModal, setShowModal] = useState<string | null>(null); // 'interaction' | 'policy'
  const [searchTerm, setSearchTerm] = useState('');

  // Forms state
  const [newLog, setNewLog] = useState<Partial<ExternalInteraction>>({
    entityName: '',
    type: 'Email',
    subject: '',
    notes: ''
  });

  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
    providerName: '',
    policyNumber: '',
    type: 'Globale Fabbricati',
    annualPremium: 0,
    startDate: '',
    expiryDate: '',
    status: 'Attiva'
  });

  const handleSaveLog = () => {
    if (!newLog.entityName || !newLog.subject) return;

    const interaction: ExternalInteraction = {
      id: crypto.randomUUID(),
      entityName: newLog.entityName,
      type: newLog.type as any,
      subject: newLog.subject,
      notes: newLog.notes || '',
      date: new Date().toISOString()
    };

    updateState(prev => ({
      ...prev,
      externalInteractions: [...(prev.externalInteractions || []), interaction]
    }));
    setShowModal(null);
    setNewLog({ entityName: '', type: 'Email', subject: '', notes: '' });
  };

  const handleSavePolicy = () => {
    if (!newPolicy.providerName || !newPolicy.expiryDate) return;
    const policy: InsurancePolicy = {
      id: crypto.randomUUID(),
      providerName: newPolicy.providerName,
      policyNumber: newPolicy.policyNumber || '',
      type: newPolicy.type || 'Polizza',
      annualPremium: Number(newPolicy.annualPremium) || 0,
      startDate: newPolicy.startDate || '',
      expiryDate: newPolicy.expiryDate,
      status: newPolicy.status as any || 'Attiva',
      notes: newPolicy.notes
    };
    updateState(prev => ({
      ...prev,
      insurancePolicies: [...(prev.insurancePolicies || []), policy]
    }));
    setShowModal(null);
    setNewPolicy({ providerName: '', policyNumber: '', type: 'Globale Fabbricati', annualPremium: 0, startDate: '', expiryDate: '', status: 'Attiva' });
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'Email': return <Mail size={16} className="text-blue-500" />;
      case 'Telefono': return <Phone size={16} className="text-green-500" />;
      case 'Incontro': return <MessageSquare size={16} className="text-amber-500" />;
      case 'PEC': return <ShieldCheck size={16} className="text-purple-500" />;
      default: return <Truck size={16} />;
    }
  };

  const isExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0;
  };

  const sortedInteractions = (state.externalInteractions || [])
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(i => i.entityName.toLowerCase().includes(searchTerm.toLowerCase()) || i.subject.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Centro Comunicazioni Esterne</h2>
          <p className="text-slate-500">Tracciamento interazioni con fornitori e gestione polizze</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModal('interaction')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-medium transition-all"
          >
            <Activity size={18} />
            Log Interazione
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'interactions', label: 'Storico Comunicazioni', icon: History },
          { id: 'insurance', label: 'Polizze Assicurative', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder={`Cerca in ${activeTab === 'interactions' ? 'comunicazioni' : 'polizze'}...`}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {/* Summary Cards */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-indigo-500" />
              Prossime Scadenze
            </h3>
            <div className="space-y-3">
              {(state.insurancePolicies || []).filter(p => isExpiringSoon(p.expiryDate)).length > 0 ? (
                (state.insurancePolicies || []).filter(p => isExpiringSoon(p.expiryDate)).map(p => (
                  <div key={p.id} className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[10px] font-black text-red-400 uppercase">Scadenza Polizza</p>
                    <p className="text-sm font-bold text-red-900">{p.providerName}</p>
                    <div className="flex items-center gap-1 text-xs text-red-700 mt-1">
                      <Calendar size={12} />
                      {new Date(p.expiryDate).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-2">Nessuna scadenza imminente</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold mb-1">Supporto Condominiale</h3>
            <p className="text-white/70 text-xs mb-4">Numeri utili per emergenze</p>
            <div className="space-y-2">
              <a href={`tel:${state.settings.adminPhone}`} className="flex items-center justify-between p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <span className="text-xs font-medium">Amministratore</span>
                <Phone size={14} />
              </a>
              <div className="flex items-center justify-between p-2 bg-white/10 rounded-lg opacity-50 cursor-not-allowed">
                <span className="text-xs font-medium">Vigili del Fuoco</span>
                <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">115</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'interactions' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {sortedInteractions.map(log => (
                  <div key={log.id} className="p-5 flex gap-4 hover:bg-slate-50/80 transition-colors group">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{log.subject}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              log.type === 'Email' ? 'bg-blue-100 text-blue-700' :
                              log.type === 'Telefono' ? 'bg-green-100 text-green-700' :
                              log.type === 'PEC' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Building2 size={12} />
                            {log.entityName}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase py-1 px-2 bg-slate-50 rounded-lg">
                          {new Date(log.date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {log.notes}
                      </p>
                    </div>
                  </div>
                ))}
                {sortedInteractions.length === 0 && (
                  <div className="p-20 text-center text-slate-400 bg-slate-50/30">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity size={32} className="text-slate-300" />
                    </div>
                    <p className="font-medium">Nessuna interazione registrata</p>
                    <p className="text-sm mt-1">Usa il pulsante in alto per aggiungere un log.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="space-y-4">
              {(state.insurancePolicies || []).map(policy => (
                <div key={policy.id} className="bg-white overflow-hidden rounded-3xl border border-slate-100 shadow-sm group">
                  <div className="p-1 flex">
                    <div className={`w-2 rounded-l-2xl ${policy.status === 'Attiva' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex-1 p-5">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                            <ShieldCheck size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-lg">{policy.providerName}</h4>
                              <div className="flex gap-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  policy.status === 'Attiva' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {policy.status}
                                </span>
                                {isExpiringSoon(policy.expiryDate) && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm animate-pulse">
                                    Scadenza Imminente
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-500">Polizza n. {policy.policyNumber}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:flex gap-6 text-center md:text-right">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Premio Annuo</p>
                            <p className="text-sm font-bold text-slate-900">€ {policy.annualPremium.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Scadenza</p>
                            <p className={`text-sm font-bold ${isExpiringSoon(policy.expiryDate) ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                              {new Date(policy.expiryDate).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
                          <ExternalLink size={14} />
                          Denuncia Sinistro
                        </button>
                        <button className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all">
                          Vedi Storico
                        </button>
                        <button className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all">
                          Gestisci Documenti
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div 
                onClick={() => setShowModal('policy')}
                className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 cursor-pointer transition-all bg-slate-50/50"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-bold">Aggiungi Nuova Polizza</span>
                <span className="text-sm">Assicura il fabbricato o i pannelli solari</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal === 'interaction' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Registra Comunicazione</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Fornitore o Assicurazione</label>
                <input 
                  type="text" 
                  value={newLog.entityName}
                  onChange={e => setNewLog({...newLog, entityName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="Seleziona o scrivi nome..."
                  list="entities-list"
                />
                <datalist id="entities-list">
                  {state.suppliers?.map(s => <option key={s.id} value={s.name} />)}
                  {state.insurancePolicies?.map(p => <option key={p.id} value={p.providerName} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Mezzo</label>
                  <select 
                    value={newLog.type}
                    onChange={e => setNewLog({...newLog, type: e.target.value as any})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  >
                    <option value="Email">Email</option>
                    <option value="Telefono">Telefono</option>
                    <option value="Incontro">Incontro di persona</option>
                    <option value="PEC">PEC</option>
                    <option value="Altro">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Oggetto</label>
                  <input 
                    type="text" 
                    value={newLog.subject}
                    onChange={e => setNewLog({...newLog, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="Oggetto sintattico..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Contenuto e Note</label>
                <textarea 
                  rows={4}
                  value={newLog.notes}
                  onChange={e => setNewLog({...newLog, notes: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all font-medium"
                  placeholder="Dettagli discussione..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowModal(null)}
                  className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleSaveLog}
                  className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
                >
                  Salva Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal === 'policy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Censimento Polizza</h3>
              <button onClick={() => setShowModal(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Compagnia Assicurativa</label>
                  <input 
                    type="text" 
                    value={newPolicy.providerName}
                    onChange={e => setNewPolicy({...newPolicy, providerName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">N. Polizza</label>
                  <input 
                    type="text" 
                    value={newPolicy.policyNumber}
                    onChange={e => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Premio Annuo (€)</label>
                  <input 
                    type="number" 
                    value={newPolicy.annualPremium}
                    onChange={e => setNewPolicy({...newPolicy, annualPremium: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Data Inizio</label>
                  <input 
                    type="date" 
                    value={newPolicy.startDate}
                    onChange={e => setNewPolicy({...newPolicy, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-1.5 ml-1">Data Scadenza</label>
                  <input 
                    type="date" 
                    value={newPolicy.expiryDate}
                    onChange={e => setNewPolicy({...newPolicy, expiryDate: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none border-indigo-200"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(null)} className="flex-1 py-3 text-slate-500 font-bold bg-slate-100 rounded-2xl">Esci</button>
                <button onClick={handleSavePolicy} className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100">Attiva Polizza</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalContacts;
