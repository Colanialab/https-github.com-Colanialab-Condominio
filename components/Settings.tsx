
import React, { useState, useEffect } from 'react';
import { AppState, CondoSettings } from '../types';
import { Building2, Landmark, UserCog, Camera, Save } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, updateState }) => {
  // Stato locale per gestire le modifiche in tempo reale prima del salvataggio differito
  const [localSettings, setLocalSettings] = useState<CondoSettings>(state.settings);

  // Effetto per il salvataggio automatico ogni 3 secondi (debounce)
  useEffect(() => {
    // Verifichiamo se ci sono differenze reali per evitare aggiornamenti inutili
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(state.settings);
    
    if (hasChanges) {
      const timer = setTimeout(() => {
        updateState(prev => ({
          ...prev,
          settings: localSettings
        }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [localSettings, state.settings, updateState]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalSettings(prev => ({
        ...prev,
        logo: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurazione Condominio</h2>
        <p className="text-slate-500">Gestisci i dati legali e fiscali necessari per la conformità</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Main Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {localSettings.logo ? (
                  <img src={localSettings.logo} className="w-full h-full object-contain" alt="Logo" />
                ) : (
                  <Building2 size={48} className="text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                <Camera size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>
            <h3 className="font-bold text-slate-800 text-center">{localSettings.condoName || 'Nome Condominio'}</h3>
            <p className="text-xs text-slate-400 uppercase font-bold mt-1">Logo Ufficiale</p>
          </div>

          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <Landmark size={18} />
              Dati Fiscali
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-indigo-200 mb-1">Codice Fiscale</label>
                <input 
                  name="taxCode"
                  value={localSettings.taxCode}
                  onChange={handleChange}
                  placeholder="Inserisci CF..."
                  className="w-full bg-indigo-500/50 border border-indigo-400 rounded-lg px-3 py-2 text-white placeholder:text-indigo-300 outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-indigo-200 mb-1">IBAN Condominiale</label>
                <input 
                  name="iban"
                  value={localSettings.iban}
                  onChange={handleChange}
                  placeholder="IBAN per i versamenti..."
                  className="w-full bg-indigo-500/50 border border-indigo-400 rounded-lg px-3 py-2 text-white placeholder:text-indigo-300 outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <Building2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Dati di Ubicazione</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Denominazione Condominio</label>
                <input 
                  name="condoName"
                  value={localSettings.condoName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Indirizzo</label>
                <input 
                  name="address"
                  value={localSettings.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Città</label>
                <input 
                  name="city"
                  value={localSettings.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prov.</label>
                  <input 
                    name="province"
                    maxLength={2}
                    value={localSettings.province}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CAP</label>
                  <input 
                    name="zipCode"
                    value={localSettings.zipCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <UserCog size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Amministrazione</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominativo Amministratore</label>
                <input 
                  name="administrator"
                  value={localSettings.administrator}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefono/Contatto</label>
                <input 
                  name="adminPhone"
                  value={localSettings.adminPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Note Normative / Altre Info</label>
                <textarea 
                  name="notes"
                  rows={3}
                  value={localSettings.notes}
                  onChange={handleChange}
                  placeholder="Informazioni aggiuntive necessarie per la gestione..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
