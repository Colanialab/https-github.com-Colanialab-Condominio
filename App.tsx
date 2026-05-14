
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Wallet, 
  FileText, 
  Calendar, 
  BookOpen, 
  Mail, 
  BarChart3,
  Settings as SettingsIcon,
  Menu,
  X,
  Landmark,
  ShieldCheck,
  Truck,
  AlertOctagon,
  Scale
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import OwnersRegistry from './components/OwnersRegistry';
import ExpensesManager from './components/ExpensesManager';
import FinanceTracker from './components/FinanceTracker';
import DocumentLibrary from './components/DocumentLibrary';
import CondoWiki from './components/CondoWiki';
import CalendarView from './components/CalendarView';
import ReportGenerator from './components/ReportGenerator';
import CommunicationCenter from './components/CommunicationCenter';
import Settings from './components/Settings';
import TaxManager from './components/TaxManager';
import LegalCenter from './components/LegalCenter';
import ExternalContacts from './components/ExternalContacts';
import SupplierManager from './components/SupplierManager';
import DebtManager from './components/DebtManager';
import RegulationManager from './components/RegulationManager';
import { AppState } from './types';

const STORAGE_KEY = 'condo_manage_pro_state';

const initialData: AppState = {
  owners: [],
  payments: [],
  expenses: [],
  taxPayments: [],
  legalNotices: [],
  externalInteractions: [],
  debtActions: [],
  documents: [],
  events: [],
  settings: {
    condoName: 'Nuovo Condominio',
    logo: null,
    address: '',
    city: '',
    province: '',
    zipCode: '',
    taxCode: '',
    administrator: '',
    adminPhone: '',
    iban: '',
    notes: ''
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'owners', label: 'Anagrafica', icon: Users },
    { id: 'expenses', label: 'Spese e Preventivi', icon: Receipt },
    { id: 'tax', label: 'Fisco ed F24', icon: Landmark },
    { id: 'finances', label: 'Cassa e Bilancio', icon: Wallet },
    { id: 'debts', label: 'Insoluti e Diffide', icon: AlertOctagon },
    { id: 'regulation', label: 'Regolamento', icon: Scale },
    { id: 'legal', label: 'Centro Legale', icon: ShieldCheck },
    { id: 'suppliers', label: 'Anagrafica Fornitori', icon: Truck },
    { id: 'external', label: 'Log Comunicazioni', icon: Mail },
    { id: 'documents', label: 'Documenti', icon: FileText },
    { id: 'calendar', label: 'Scadenze', icon: Calendar },
    { id: 'communications', label: 'Mailing List', icon: Mail },
    { id: 'reports', label: 'Report', icon: BarChart3 },
    { id: 'wiki', label: 'Wiki Legale', icon: BookOpen },
    { id: 'settings', label: 'Configurazione', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} setActiveTab={setActiveTab} />;
      case 'owners': return <OwnersRegistry state={state} updateState={updateState} />;
      case 'expenses': return <ExpensesManager state={state} updateState={updateState} />;
      case 'tax': return <TaxManager state={state} updateState={updateState} />;
      case 'finances': return <FinanceTracker state={state} updateState={updateState} />;
      case 'debts': return <DebtManager state={state} updateState={updateState} />;
      case 'regulation': return <RegulationManager state={state} updateState={updateState} />;
      case 'legal': return <LegalCenter state={state} updateState={updateState} />;
      case 'suppliers': return <SupplierManager state={state} updateState={updateState} />;
      case 'external': return <ExternalContacts state={state} updateState={updateState} />;
      case 'documents': return <DocumentLibrary state={state} updateState={updateState} />;
      case 'calendar': return <CalendarView state={state} updateState={updateState} />;
      case 'reports': return <ReportGenerator state={state} updateState={updateState} />;
      case 'communications': return <CommunicationCenter state={state} />;
      case 'wiki': return <CondoWiki />;
      case 'settings': return <Settings state={state} updateState={updateState} />;
      default: return <Dashboard state={state} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">CondoPro</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{state.settings.condoName}</span>
              <span className="text-xs text-slate-500">{state.settings.city} ({state.settings.province})</span>
            </div>
            {state.settings.logo ? (
              <img src={state.settings.logo} className="h-10 w-10 object-contain rounded border" alt="Logo" />
            ) : (
              <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center border text-slate-400">
                <LayoutDashboard size={20} />
              </div>
            )}
          </div>
        </header>

        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden">
          <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-slate-800">
              <span className="font-bold text-xl">CondoPro</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === item.id ? 'bg-indigo-600' : 'text-slate-400'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
