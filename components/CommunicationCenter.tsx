
import React, { useState } from 'react';
import { AppState } from '../types';
import { Mail, Send, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { generateProfessionalNotice } from '../services/geminiService';

interface CommunicationCenterProps {
  state: AppState;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ state }) => {
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!subject) return;
    setLoading(true);
    const result = await generateProfessionalNotice(subject, details);
    setGeneratedText(result || '');
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Mailing List e Comunicazioni</h2>
          <p className="text-slate-500">Crea messaggi professionali per i condomini</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Oggetto della Comunicazione</label>
            <input 
              type="text" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="es. Sollecito pagamento quote, Convocazione Assemblea..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dettagli Aggiuntivi (IA)</label>
            <textarea 
              rows={4}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Inserisci i punti chiave che l'IA deve includere nel messaggio..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !subject}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold"
          >
            {loading ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={20} />}
            Genera Messaggio con IA
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Mail size={18} className="text-indigo-400" />
            Mailing List Condomini
          </h3>
          <div className="space-y-2">
            {state.owners.map(owner => (
              <div key={owner.id} className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="font-medium">{owner.name}</span>
                <span className="text-xs text-slate-400">{owner.email || 'Email non presente'}</span>
              </div>
            ))}
            {state.owners.length === 0 && <p className="text-slate-500 text-sm">Nessun condomino registrato.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Bozza Messaggio</h3>
          {generatedText && (
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              {copied ? 'Copiato!' : 'Copia Testo'}
            </button>
          )}
        </div>
        <div className="flex-1 p-6">
          {generatedText ? (
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed font-serif">
              {generatedText}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Send size={48} className="opacity-20" />
              <p>Il messaggio generato apparirà qui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;
