
import React, { useState, useRef } from 'react';
import { AppState } from '../types';
import { Download, FileText, Layout, Users, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportGeneratorProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ state, updateState }) => {
  const [reportType, setReportType] = useState<'budget' | 'expenses' | 'owners'>('budget');
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${state.settings.condoName}_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF Generation error:', error);
      alert('Errore durante la generazione del PDF. Riprova.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPayments = state.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Generazione Report</h2>
          <p className="text-slate-500">Configura ed esporta documenti ufficiali</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 shadow-lg font-bold disabled:opacity-50 transition-all"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isGenerating ? 'Generazione...' : 'Stampa / Esporta'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setReportType('budget')}
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${reportType === 'budget' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
        >
          <Layout size={20} />
          <span className="font-bold">Bilancio</span>
        </button>
        <button 
          onClick={() => setReportType('expenses')}
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${reportType === 'expenses' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
        >
          <FileText size={20} />
          <span className="font-bold">Dettaglio Spese</span>
        </button>
        <button 
          onClick={() => setReportType('owners')}
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${reportType === 'owners' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
        >
          <Users size={20} />
          <span className="font-bold">Anagrafica</span>
        </button>
      </div>

      {/* Report Preview */}
      <div className="bg-slate-200 p-8 rounded-xl overflow-x-auto">
        <div className="bg-white shadow-2xl rounded-sm p-12 min-h-[297mm] w-[210mm] text-slate-900 mx-auto" ref={reportRef}>
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div className="flex gap-6">
              {state.settings.logo && <img src={state.settings.logo} className="h-20 w-20 object-contain" alt="Condo Logo" />}
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter">{state.settings.condoName}</h1>
                <p className="text-xs font-bold text-slate-600">
                  {state.settings.address} - {state.settings.zipCode} {state.settings.city} ({state.settings.province})
                </p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">
                  Codice Fiscale: <span className="font-bold">{state.settings.taxCode || '---'}</span>
                </p>
                <p className="text-[10px] text-slate-500 uppercase">
                  Amministratore: <span className="font-bold">{state.settings.administrator || '---'}</span>
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] uppercase font-bold text-slate-400 space-y-1">
              <p>Data Documento: {new Date().toLocaleDateString()}</p>
              <p>Rif: {reportType.toUpperCase()}-{new Date().getFullYear()}</p>
              {state.settings.iban && <p className="text-indigo-600 mt-2">IBAN: {state.settings.iban}</p>}
            </div>
          </div>

          {reportType === 'budget' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 uppercase">Situazione Finanziaria Generale</h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Entrate Totali (Versamenti)</p>
                  <p className="text-3xl font-black text-green-600">€{totalPayments.toFixed(2)}</p>
                </div>
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Uscite Totali (Spese)</p>
                  <p className="text-3xl font-black text-red-600">€{totalExpenses.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 uppercase text-slate-700">Ripartizione Millesimale e Saldi</h3>
                <div className="space-y-1 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-5 font-bold text-[10px] uppercase bg-slate-900 text-white p-3">
                    <span>Unità</span>
                    <span className="col-span-1">Proprietario</span>
                    <span className="text-center">Millesimi</span>
                    <span className="text-right">Versato</span>
                    <span className="text-right">Saldo</span>
                  </div>
                  {state.owners.map(owner => {
                    const ownerPayments = state.payments.filter(p => p.ownerId === owner.id).reduce((a,c) => a+c.amount, 0);
                    const expectedShare = (totalExpenses * owner.millesimi) / 1000;
                    const balance = ownerPayments - expectedShare;
                    return (
                      <div key={owner.id} className="grid grid-cols-5 text-xs p-3 border-b border-slate-100 last:border-0 items-center">
                        <span className="font-bold">{owner.unit}</span>
                        <span className="truncate">{owner.name}</span>
                        <span className="text-center">{owner.millesimi.toFixed(2)}</span>
                        <span className="text-right">€{ownerPayments.toFixed(2)}</span>
                        <span className={`text-right font-black ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance >= 0 ? '+' : ''}€{balance.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {reportType === 'expenses' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 uppercase">Registro Analitico Spese</h2>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 font-bold text-[10px] uppercase bg-slate-900 text-white p-3">
                  <span>Data</span>
                  <span className="col-span-2">Descrizione</span>
                  <span>Categoria</span>
                  <span className="text-right">Importo</span>
                </div>
                {state.expenses.length > 0 ? (
                  state.expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ex => (
                    <div key={ex.id} className="grid grid-cols-5 text-xs p-3 border-b border-slate-100 last:border-0">
                      <span>{new Date(ex.date).toLocaleDateString()}</span>
                      <span className="col-span-2 font-medium">{ex.description}</span>
                      <span className="text-slate-500 italic">{ex.category}</span>
                      <span className="text-right font-bold">€{ex.amount.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-slate-400 text-sm">Nessuna spesa registrata nel periodo.</div>
                )}
                <div className="grid grid-cols-5 bg-slate-50 p-3 font-black text-sm">
                  <span className="col-span-4 uppercase">Totale Complessivo</span>
                  <span className="text-right text-red-600">€{totalExpenses.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {reportType === 'owners' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold border-l-4 border-indigo-600 pl-4 uppercase">Elenco Unità e Millesimi</h2>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-5 font-bold text-[10px] uppercase bg-slate-900 text-white p-3">
                  <span>Unità</span>
                  <span className="col-span-2">Proprietario</span>
                  <span className="text-center">Millesimi</span>
                  <span className="text-right">Contatto</span>
                </div>
                {state.owners.map(owner => (
                  <div key={owner.id} className="grid grid-cols-5 text-xs p-3 border-b border-slate-100 last:border-0 items-center">
                    <span className="font-black">{owner.unit}</span>
                    <span className="col-span-2 font-medium">{owner.name}</span>
                    <span className="text-center font-bold text-indigo-600">{owner.millesimi.toFixed(2)}</span>
                    <span className="text-right text-[9px] text-slate-500 leading-tight">
                      {owner.email}<br/>{owner.phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-auto pt-12 border-t border-slate-100 text-[10px] text-slate-300 uppercase font-medium flex justify-between">
            <div>
              <p>Amministratore: {state.settings.administrator}</p>
              {state.settings.adminPhone && <p>Contatto: {state.settings.adminPhone}</p>}
            </div>
            <div className="text-right">
              <p>Generato tramite CondoManage Pro</p>
              <p>Pagina 1 di 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
