
import React from 'react';
import { AppState, Event, Expense } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertCircle, Wallet, Calendar, Wrench, BellRing, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, setActiveTab }) => {
  const totalExpenses = state.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPayments = state.payments.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalPayments - totalExpenses;

  const data = [
    { name: 'Entrate', value: totalPayments, color: '#10b981' },
    { name: 'Uscite', value: totalExpenses, color: '#ef4444' }
  ];

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = state.events
    .filter(e => e.date >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const todayEvents = state.events.filter(e => e.date === today);

  // Calcolo spese scadute e non pagate
  const overdueExpenses = state.expenses.filter(ex => !ex.paid && ex.dueDate && ex.dueDate < today);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Deadline': return <BellRing size={16} className="text-red-500" />;
      case 'Maintenance': return <Wrench size={16} className="text-amber-500" />;
      case 'Meeting': return <Users size={16} className="text-indigo-500" />;
      default: return <Calendar size={16} className="text-slate-500" />;
    }
  };

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'Deadline': return 'bg-red-50 text-red-600 border-red-100';
      case 'Maintenance': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Meeting': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Today's Alerts & Overdue Reminders */}
      <div className="space-y-3">
        {todayEvents.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-full animate-pulse">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-red-800">Scadenze odierne: {todayEvents.length}</p>
                <p className="text-sm text-red-600">{todayEvents.map(e => e.title).join(', ')}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-black uppercase tracking-widest text-red-700 hover:underline"
            >
              Vedi Calendario
            </button>
          </div>
        )}

        {overdueExpenses.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-amber-800">Attenzione: {overdueExpenses.length} spese scadute e non pagate!</p>
                <p className="text-sm text-amber-600">Totale da saldare: €{overdueExpenses.reduce((a,c) => a+c.amount, 0).toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('expenses')}
              className="text-xs font-black uppercase tracking-widest text-amber-700 hover:underline"
            >
              Gestisci Pagamenti
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Entrate Totali</p>
              <p className="text-2xl font-bold text-slate-900">€{totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Spese Totali</p>
              <p className="text-2xl font-bold text-slate-900">€{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Condomini</p>
              <p className="text-2xl font-bold text-slate-900">{state.owners.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Cassa Attuale</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Andamento Finanziario</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deadlines Widget */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Prossime Scadenze</h3>
            <Calendar className="text-slate-300" size={20} />
          </div>
          
          <div className="space-y-4 flex-1">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="group relative flex gap-4 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                  <div className={`h-12 w-12 rounded-lg flex flex-col items-center justify-center border flex-shrink-0 bg-white ${event.date === today ? 'border-red-200' : 'border-slate-100'}`}>
                    <span className={`text-[10px] uppercase font-bold ${event.date === today ? 'text-red-500' : 'text-slate-400'}`}>
                      {new Date(event.date).toLocaleString('it', { month: 'short' })}
                    </span>
                    <span className={`text-lg font-bold leading-tight ${event.date === today ? 'text-red-600' : 'text-slate-900'}`}>
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase flex items-center gap-1 ${getEventBadgeClass(event.type)}`}>
                        {getEventIcon(event.type)}
                        {event.type}
                      </span>
                      {event.date === today && (
                        <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Oggi</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                <AlertCircle className="mb-2 opacity-20" size={48} />
                <p className="text-sm">Nessuna scadenza imminente</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className="w-full mt-6 py-3 text-sm text-indigo-600 font-bold hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Vedi Calendario Completo
            <TrendingUp size={16} className="rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
