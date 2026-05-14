
import React, { useState } from 'react';
import { AppState, Owner, LegalNotice, DebtAction } from '../types';
import { 
  AlertOctagon, 
  FileText, 
  Send, 
  Sparkles, 
  CheckCircle, 
  Download, 
  Clock, 
  Mail, 
  Search, 
  ChevronRight, 
  History,
  Scale,
  MessageSquare,
  Gavel,
  ArrowRight
} from 'lucide-react';
import { generateDebtActionText } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface DebtManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

type ActionType = 'Sollecito Bonario' | 'Diffida' | 'Decreto Ingiuntivo';

const DebtManager: React.FC<DebtManagerProps> = ({ state, updateState }) => {
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(false);
  const [diffidaText, setDiffidaText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionType, setActiveActionType] = useState<ActionType>('Diffida');

  const getOwnerDebt = (owner: Owner) => {
    const ownerPayments = state.payments
      .filter(p => p.ownerId === owner.id)
      .reduce((acc, p) => acc + p.amount, 0);
    
    const ownerCount = state.owners.length || 1;
    const expectedShare = state.expenses.reduce((acc, expense) => {
      if (expense.divisionType === 'Equally') {
        return acc + (expense.amount / ownerCount);
      } else {
        return acc + (expense.amount * owner.millesimi) / 1000;
      }
    }, 0);

    const debt = expectedShare - ownerPayments;
    return debt > 0 ? debt : 0;
  };

  const handleGenerateAction = async (owner: Owner, type: ActionType) => {
    const debt = getOwnerDebt(owner);
    if (debt <= 0) return;
    
    setLoading(true);
    setSelectedOwner(owner);
    setActiveActionType(type);
    const text = await generateDebtActionText(type, owner.name, debt, state.settings.condoName, state.settings.iban);
    setDiffidaText(text || '');
    setLoading(false);
  };

  const handleSendAndProtocol = () => {
    if (!selectedOwner || !diffidaText) return;

    // 1. Protocollazione automatica
    const newNotice: LegalNotice = {
      id: crypto.randomUUID(),
      protocolNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientId: selectedOwner.id,
      subject: `${activeActionType} - Debito €${getOwnerDebt(selectedOwner).toFixed(2)}`,
      content: diffidaText,
      date: new Date().toISOString(),
      type: 'Diffida',
      status: 'Inviata'
    };

    const newDebtAction: DebtAction = {
      id: crypto.randomUUID(),
      ownerId: selectedOwner.id,
      type: activeActionType as any,
      date: new Date().toISOString(),
      amount: getOwnerDebt(selectedOwner),
      notes: diffidaText.substring(0, 100) + '...',
      documentId: newNotice.id
    };

    updateState(prev => ({
      ...prev,
      legalNotices: [...(prev.legalNotices || []), newNotice],
      debtActions: [...(prev.debtActions || []), newDebtAction]
    }));

    // 2. Mailto link helper
    const subject = encodeURIComponent(`[RECUPERO CREDITI] ${activeActionType} - ${state.settings.condoName}`);
    const body = encodeURIComponent(diffidaText);
    const mailtoLink = `mailto:${selectedOwner.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDownloadPDF = () => {
    if (!selectedOwner || !diffidaText) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(state.settings.condoName, 20, 20);
    doc.setFontSize(10);
    doc.text(`${state.settings.address}, ${state.settings.city}`, 20, 30);
    
    doc.setFontSize(14);
    doc.text(activeActionType.toUpperCase(), 20, 50);
    
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(diffidaText, 170);
    doc.text(splitText, 20, 70);
    
    doc.save(`${activeActionType}_${selectedOwner.name.replace(/\s+/g, '_')}.pdf`);
  };

  const insolvents = state.owners
    .map(o => ({ owner: o, debt: getOwnerDebt(o) }))
    .filter(i => i.debt > 0)
    .filter(i => i.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.debt - a.debt);

  const totalBuildingDebt = insolvents.reduce((acc, i) => acc + i.debt, 0);

  const getHistoryForOwner = (ownerId: string) => {
    return (state.debtActions || [])
      .filter(a => a.ownerId === ownerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ufficio Recupero Crediti</h2>
          <p className="text-slate-500">Gestione morosità e procedure legali automatizzate</p>
        </div>
        <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100 flex items-center gap-4 shadow-sm">
          <div className="p-2 bg-red-100 rounded-lg text-red-600">
            <AlertOctagon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-wider">Debito Totale Fabbricato</p>
            <p className="text-2xl font-black text-red-600">€ {totalBuildingDebt.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              id="debt-owner-search"
              type="text"
              placeholder="Cerca condomino moroso..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Elenco Morosità</h3>
              <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {insolvents.length} Casi
              </span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {insolvents.map(({ owner, debt }) => (
                <div 
                  key={owner.id} 
                  onClick={() => setSelectedOwner(owner)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedOwner?.id === owner.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{owner.name}</h4>
                      <p className="text-xs text-slate-500">{owner.unit} • {owner.millesimi} mill.</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-600">€{debt.toFixed(2)}</p>
                      <button className="text-[10px] font-black uppercase text-indigo-500 flex items-center gap-1 ml-auto mt-1">
                        Dettagli <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {insolvents.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <p className="text-slate-900 font-bold">Tutto in regola</p>
                  <p className="text-xs text-slate-400 mt-1">Nessun condomino presenta insoluti al momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {selectedOwner ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* AI Generation Tools */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-indigo-500" size={24} />
                    <div>
                      <h3 className="font-bold text-slate-800">Generatore Legale IA</h3>
                      <p className="text-xs text-slate-500">Seleziona il tipo di intervento per {selectedOwner.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { id: 'Sollecito Bonario', icon: MessageSquare, label: 'Sollecito', btnId: 'btn-generate-reminder' },
                      { id: 'Diffida', icon: Scale, label: 'Diffida', btnId: 'btn-generate-warning' },
                      { id: 'Decreto Ingiuntivo', icon: Gavel, label: 'Decreto', btnId: 'btn-generate-injunction' },
                    ].map(type => (
                      <button
                        id={type.btnId}
                        key={type.id}
                        onClick={() => handleGenerateAction(selectedOwner, type.id as ActionType)}
                        disabled={loading}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                          activeActionType === type.id 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-slate-50 hover:border-slate-200 text-slate-500'
                        }`}
                      >
                        <type.icon size={20} />
                        <span className="text-[10px] font-black uppercase">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div id="ai-document-container" className="min-h-[400px] bg-slate-50 rounded-2xl border border-slate-100 p-6 relative">
                    {loading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/80 rounded-2xl z-10">
                        <Clock size={40} className="animate-spin text-indigo-300 mb-4" />
                        <p className="font-bold">L'IA sta elaborando...</p>
                      </div>
                    ) : diffidaText ? (
                      <div className="h-full flex flex-col">
                        <div className="flex-1 text-sm font-serif leading-relaxed whitespace-pre-wrap">
                          {diffidaText}
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button 
                            id="btn-download-pdf"
                            onClick={handleDownloadPDF}
                            className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                          >
                            <Download size={14} />
                            Scarica PDF
                          </button>
                          <button 
                            id="btn-send-protocol"
                            onClick={handleSendAndProtocol}
                            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                          >
                            <Send size={14} />
                            Invia e Protocolla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                        <FileText size={48} className="mb-4" />
                        <p className="font-medium">Clicca su un'azione per generare il testo</p>
                      </div>
                    )}

                    {showSuccess && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-2xl text-[10px] font-black uppercase flex items-center gap-2 animate-in zoom-in slide-in-from-top-4">
                        <CheckCircle size={14} />
                        Azione Registrata con Successo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Stats */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-tighter">Statistiche Condomino</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="text-xs text-slate-500">Debito Accumulato</span>
                      <span className="text-sm font-black text-red-600">€{getOwnerDebt(selectedOwner).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                      <span className="text-xs text-slate-500">Ultimo Pagamento</span>
                      <span className="text-sm font-bold text-slate-700">N/D</span>
                    </div>
                  </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <History size={16} className="text-slate-400" />
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Cronologia Azioni</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {getHistoryForOwner(selectedOwner.id).map(action => (
                      <div key={action.id} className="relative pl-6 pb-4 border-l border-slate-100 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">
                            {new Date(action.date).toLocaleDateString('it-IT')}
                          </p>
                          <p className="text-sm font-bold text-slate-800">{action.type}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-1">{action.notes}</p>
                        </div>
                      </div>
                    ))}
                    {getHistoryForOwner(selectedOwner.id).length === 0 && (
                      <p className="text-[10px] text-slate-400 italic text-center py-4">Nessuna azione precedente</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center py-48 text-slate-300">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Scale size={48} className="opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Modulo Recupero Crediti</h3>
              <p className="text-sm mt-1 max-w-sm text-center">
                Seleziona un condomino dalla lista a sinistra per visualizzare la sua posizione debitoria e avviare azioni di recupero crediti tramite Intelligenza Artificiale.
              </p>
              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2 text-xs opacity-50 px-4 py-2 bg-slate-50 rounded-full">
                  <Sparkles size={12} /> Testi Legali IA
                </div>
                <div className="flex items-center gap-2 text-xs opacity-50 px-4 py-2 bg-slate-50 rounded-full">
                  <Clock size={12} /> Storico Tracciabile
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtManager;
