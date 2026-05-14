
import React, { useState } from 'react';
import { queryCondoWiki } from '../services/geminiService';
import { Search, BookOpen, Send, Sparkles } from 'lucide-react';

const CondoWiki: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    const result = await queryCondoWiki(question);
    setAnswer(result || '');
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">Wiki Legale Condominiale</h2>
        <p className="text-slate-500 mt-2">Informazioni in tempo reale su norme e leggi del Codice Civile</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-100">
        <form onSubmit={handleSearch} className="relative mb-8">
          <input 
            type="text" 
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Chiedi: Quali sono le maggioranze per deliberare riparazioni straordinarie?"
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-4 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Send size={20} />}
          </button>
        </form>

        {answer && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
              <Sparkles size={20} />
              <span>Risposta Assistente IA</span>
            </div>
            <div className="prose prose-slate max-w-none bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-slate-700 leading-relaxed">
              {answer.split('\n').map((para, i) => (
                <p key={i} className="mb-4 last:mb-0">{para}</p>
              ))}
            </div>
          </div>
        )}

        {!answer && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Riparto spese balconi aggettanti",
              "Diritto alla detrazione fiscale 50%",
              "Nomina amministratore sotto 8 unità",
              "Gestione del riscaldamento centralizzato"
            ].map((suggest, i) => (
              <button 
                key={i}
                onClick={() => setQuestion(suggest)}
                className="text-left p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-slate-400 group-hover:text-indigo-500" />
                  <span className="text-sm font-medium text-slate-600">{suggest}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CondoWiki;
