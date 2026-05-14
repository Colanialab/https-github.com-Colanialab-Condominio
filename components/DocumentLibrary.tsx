
import React, { useState } from 'react';
import { AppState, Document } from '../types';
import { File, Image, Upload, Trash2, Search } from 'lucide-react';

interface DocumentLibraryProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newDoc: Document = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        date: new Date().toISOString(),
        data: reader.result as string
      };
      updateState(prev => ({
        ...prev,
        documents: [...prev.documents, newDoc]
      }));
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = (id: string) => {
    if (confirm("Rimuovere il documento?")) {
      updateState(prev => ({
        ...prev,
        documents: prev.documents.filter(d => d.id !== id)
      }));
    }
  };

  const filteredDocs = state.documents.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Documenti e Fatture</h2>
          <p className="text-slate-500">Archivio digitale di verbali, foto e PDF</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 cursor-pointer shadow-lg transition-all">
            <Upload size={20} />
            Carica Documento
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Cerca per nome file..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 outline-none bg-transparent"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-50 relative">
              {doc.type.includes('image') ? (
                <img src={doc.data} className="w-full h-full object-cover" alt={doc.name} />
              ) : (
                <File size={48} className="text-slate-300" />
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteDoc(doc.id)}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-slate-800 truncate text-sm" title={doc.name}>{doc.name}</h4>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  {new Date(doc.date).toLocaleDateString()}
                </span>
                <a 
                  href={doc.data} 
                  download={doc.name}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"
                >
                  Scarica
                </a>
              </div>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            Nessun documento trovato. Carica il primo file!
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentLibrary;
