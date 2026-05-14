
import React, { useState } from 'react';
import { AppState, LegalNotice } from '../types';
import { ShieldCheck, FileText, Send, CheckCircle2, Clock, MailOpen, History, Plus } from 'lucide-react';
import { generateProfessionalNotice } from '../services/geminiService';

interface LegalCenterProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const LegalCenter: React.FC<LegalCenterProps> = ({ state, updateState }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<LegalNotice>>({
    recipientId: '',
    subject: '',
    type: 'Circolare',
    content: ''
  });

  const handleGenerateText = async () => {
    if (!newNotice.subject) return;
    setLoading(true);
    const text = await generateProfessionalNotice(newNotice.subject, "Comunicazione formale con valore legale per i condomini.");
    setNewNotice(prev => ({ ...prev, content: text }));
    setLoading(false);
  };

  const handleSaveNotice = () => {
    if (!newNotice.recipientId || !newNotice.subject || !newNotice.content) return;
    
    const notice: LegalNotice = {
      id: crypto.randomUUID(),
      protocolNumber: `PROT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientId: newNotice.recipientId,
      subject: newNotice.subject,
      content: newNotice.content,
      date: new Date().toISOString(),
      type: newNotice.type as any,
      status: 'Inviata'
    };

    updateState(prev => ({
      ...prev,
      legalNotices: [...(prev.legalNotices || []), notice]
    }));
    setShowAddModal(false);
    setNewNotice({ recipientId: '', subject: '', type: 'Circolare', content: '' });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Consegnata': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Letta': return <MailOpen size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Centro Comunicazioni Legali</h2>
          <p className="text-slate-500">Gestione archivio protocollo e invii certificati</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg"
        >
          <Plus size={20} />
          Nuovo Protocollo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800">Archivio Storico Protocolli</h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {(state.legalNotices || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notice => {
                const recipient = state.owners.find(o => o.id === notice.recipientId);
                return (
                  <div key={notice.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {notice.protocolNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(notice.date).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                        {getStatusIcon(notice.status)}
                        {notice.status}
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900">{notice.subject}</h4>
                    <p className="text-xs text-slate-500 mt-1">Destinatario: <span className="text-indigo-600">{recipient?.name || 'Tutti i Condomini'}</span></p>
                    <div className="mt-3 flex gap-2">
                      <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Vedi Ricevuta</button>
                      <button className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Scarica PDF</button>
                    </div>
                  </div>
                );
              })}
              {(!state.legalNotices || state.legalNotices.length === 0) && (
                <div className="p-12 text-center text-slate-400 italic">
                  Nessuna comunicazione protocollata presente in archivio.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl">
            <ShieldCheck className="mb-4 opacity-80" size={32} />
            <h3 className="text-lg font-bold mb-2">Valore Legale</h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              Tutte le comunicazioni protocollate in questa sezione seguono i criteri di tracciabilità necessari per eventuali contenziosi legali o delibere assembleari.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-indigo-100/80">
              <li className="flex items-center gap-2">• Numerazione protocollo univoca</li>
              <li className="flex items-center gap-2">• Data e ora certificata</li>
              <li className="flex items-center gap-2">• Log invio e ricezione</li>
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="text-indigo-600" />
              Emissione Nuovo Documento Legale
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Documento</label>
                  <select 
                    value={newNotice.type}
                    onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Circolare">Circolare Ordinaria</option>
                    <option value="Convocazione">Convocazione Assemblea</option>
                    <option value="Verbale">Verbale Assemblea</option>
                    <option value="Diffida">Diffida Legale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Destinatario</label>
                  <select 
                    value={newNotice.recipientId}
                    onChange={e => setNewNotice({...newNotice, recipientId: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleziona...</option>
                    <option value="ALL">Tutti i Condomini</option>
                    {state.owners.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.unit})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Oggetto</label>
                <input 
                  type="text" 
                  value={newNotice.subject}
                  onChange={e => setNewNotice({...newNotice, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="es. Sollecito riparazione lastrico solare..."
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-slate-700">Contenuto Documento</label>
                  <button 
                    onClick={handleGenerateText}
                    disabled={loading || !newNotice.subject}
                    className="text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
                  >
                    {loading ? 'Generazione...' : 'Aiuto IA per testo formale'}
                  </button>
                </div>
                <textarea 
                  rows={8}
                  value={newNotice.content}
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-serif text-sm leading-relaxed"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Annulla
                </button>
                <button 
                  onClick={handleSaveNotice}
                  className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg"
                >
                  Protocolla ed Invia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalCenter;
