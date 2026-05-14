
import React, { useState } from 'react';
import { AppState } from '../types';
import { Scale, FileText, Send, Clock, Dumbbell, Dog, TreePine, Car, Sparkles, Copy, Mail, CheckCircle2, ShieldAlert, Brush, Lamp } from 'lucide-react';

interface RegulationManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const defaultRegulation = (condoName: string) => `REGOLAMENTO DEL CONDOMINIO ${condoName.toUpperCase()}
Fabbricato di 5 Unità Abitative + 1 Unità ad uso Palestra Fitness
Località: Mirano (VE)

ART. 1 - ORARI DEL SILENZIO (Norme Comunali Mirano)
Per garantire la quiete e il riposo di tutti i residenti, sono stabiliti i seguenti orari di assoluto silenzio:
• Pomeridiano: dalle ore 14:00 alle ore 16:00
• Notturno: dalle ore 23:00 alle ore 08:00
In tali fasce orarie è vietata ogni attività rumorosa, inclusi lavori di manutenzione, l'uso di attrezzi fitness ad alto impatto sonoro e schiamazzi nelle aree comuni (giardino e piazzale).

ART. 2 - AREE VERDI E GIARDINI
2.1 Giardino Condominiale: Area destinata al decoro e allo svago comune. È fatto divieto di abbandonare rifiuti o oggetti personali.
2.2 Giardino ad Uso Esclusivo: Il condomino titolare dell'uso esclusivo della porzione di giardino è tenuto alla sua manutenzione ordinaria costante. L'area deve essere mantenuta in perfetto stato di pulizia e decoro per non pregiudicare il decoro architettonico dell'intero edificio.

ART. 3 - PALESTRA FITNESS
L'accesso alla palestra è consentito nel rispetto degli orari di cui all'Art. 1. 
• È obbligatorio il cambio delle calzature prima di accedere ai locali.
• Ogni utente è responsabile della pulizia e sanificazione degli attrezzi dopo l'utilizzo.

ART. 4 - ANIMALI DOMESTICI
È consentita la detenzione di animali domestici. Il proprietario dell'animale (cane) è obbligato a:
• Tenere l'animale al guinzaglio corto nel vano scale e nel piazzale.
• Assicurare l'immediata rimozione di deiezioni in ogni area (inclusi giardini).
• Impedire all'animale di disturbare la quiete nelle ore di riposo.

ART. 5 - PIAZZALE, PARCHEGGIO E VANO SCALE
• Il piazzale deve essere mantenuto libero da ingombranti. La sosta dei veicoli è consentita solo negli appositi stalli.
• Il vano scale, essendo via di fuga e area di transito comune, deve restare sgombro da biciclette, pacchi o spazzatura.
• Le luci esterne sono temporizzate per il risparmio energetico; eventuali guasti vanno segnalati tempestivamente.

ART. 6 - PULIZIA GENERALE
La pulizia delle parti comuni è fondamentale. Ogni condomino è invitato a collaborare mantenendo il piazzale e le scale privi di mozziconi o cartacce.`;

const RegulationManager: React.FC<RegulationManagerProps> = ({ state, updateState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [regulationText, setRegulationText] = useState(state.regulation || defaultRegulation(state.settings.condoName));
  const [copied, setCopied] = useState(false);
  const [showDraft, setShowDraft] = useState(false);

  const handleSave = () => {
    updateState(prev => ({ ...prev, regulation: regulationText }));
    setIsEditing(false);
  };

  const emailDraft = `Oggetto: Comunicazione Importante - Nuovo Regolamento Condominiale ${state.settings.condoName}

Gentili Condomini e Gestione Palestra,

con la presente vi invitiamo a prendere visione delle norme di convivenza aggiornate per il nostro stabile. 

PUNTI SALIENTI:
- SILENZIO: Rispettare rigorosamente le fasce 14:00-16:00 e 23:00-08:00.
- GIARDINI: Massima cura per il giardino comune e obbligo di decoro per l'area ad uso esclusivo.
- ANIMALI: Obbligo di guinzaglio e pulizia immediata nelle aree comuni.
- PALESTRA: Obbligo di scarpe pulite e sanificazione attrezzi.
- PULIZIA: Piazzale, scale e aree esterne devono restare sgombri e puliti.

Il rispetto di queste semplici regole garantirà a tutti un ambiente più sereno e ordinato.

Cordiali saluti,
L'Amministrazione del Condominio ${state.settings.condoName}`;

  const sendEmail = () => {
    const subject = encodeURIComponent(`Regolamento e Norme di Convivenza - ${state.settings.condoName}`);
    const body = encodeURIComponent(emailDraft);
    const emails = state.owners.map(o => o.email).filter(e => !!e).join(',');
    window.location.href = `mailto:?bcc=${emails}&subject=${subject}&body=${body}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestione Regolamento</h2>
          <p className="text-slate-500">Regole per le 5 unità, la palestra e le aree verdi di Mirano</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Modifica Testo
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              Salva Regolamento
            </button>
          )}
          <button 
            onClick={() => setShowDraft(!showDraft)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all"
          >
            <Sparkles size={16} />
            {showDraft ? 'Mostra Testo' : 'Genera Bozza Email'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-500" />
              Punti Critici
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Clock className="text-indigo-500 shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Quiete Mirano</p>
                  <p className="text-slate-500">14-16 / 23-08</p>
                </div>
              </div>
              <div className="flex gap-3">
                <TreePine className="text-emerald-600 shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Giardino Esclusivo</p>
                  <p className="text-slate-500">Responsabilità decoro privato.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Dumbbell className="text-slate-700 shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Igiene Palestra</p>
                  <p className="text-slate-500">Cambio scarpe e sanificazione.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Brush className="text-blue-500 shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Vano Scale</p>
                  <p className="text-slate-500">Sempre sgombro da oggetti.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Lamp className="text-yellow-500 shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Luci Esterne</p>
                  <p className="text-slate-500">Risparmio e manutenzione.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-sm font-black text-indigo-700 uppercase mb-2">Nota Amministrativa</h3>
            <p className="text-xs text-indigo-600 leading-relaxed">
              Questo regolamento deve essere approvato in sede di assemblea con la maggioranza degli intervenuti che rappresentino almeno 500 millesimi.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-slate-400" />
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  {showDraft ? 'Bozza Email di Notifica' : 'Testo Ufficiale Regolamento'}
                </span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => copyToClipboard(showDraft ? emailDraft : regulationText)}
                  className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? 'Copiato' : 'Copia'}
                </button>
                {showDraft && (
                  <button 
                    onClick={sendEmail}
                    className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-1 hover:underline"
                  >
                    <Mail size={12} />
                    Apri Mailer
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-8">
              {showDraft ? (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {emailDraft}
                </div>
              ) : isEditing ? (
                <textarea 
                  value={regulationText}
                  onChange={e => setRegulationText(e.target.value)}
                  className="w-full h-full p-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-serif text-sm leading-relaxed resize-none bg-slate-50/30"
                />
              ) : (
                <div className="prose prose-slate max-w-none font-serif text-slate-700 leading-relaxed whitespace-pre-wrap bg-white">
                  {regulationText}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
              <span>{state.settings.condoName}</span>
              <div className="flex items-center gap-1">
                <Scale size={12} />
                <span>Normative Mirano (VE)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationManager;
