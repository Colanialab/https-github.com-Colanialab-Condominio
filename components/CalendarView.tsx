
import React, { useState } from 'react';
import { AppState, Event } from '../types';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface CalendarViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ state, updateState }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventData, setEventData] = useState<Omit<Event, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'Deadline'
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = { ...eventData, id: crypto.randomUUID() };
    updateState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    setShowAddModal(false);
  };

  const deleteEvent = (id: string) => {
    updateState(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const sortedEvents = [...state.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario e Scadenze</h2>
          <p className="text-slate-500">Gestisci assemblee, manutenzioni e termini di pagamento</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-lg"
        >
          <Plus size={20} />
          Nuova Scadenza
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map(event => (
          <div key={event.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg text-white ${
                event.type === 'Deadline' ? 'bg-red-500' : 
                event.type === 'Maintenance' ? 'bg-amber-500' : 'bg-indigo-500'
              }`}>
                <CalendarIcon size={18} />
              </div>
              <button 
                onClick={() => deleteEvent(event.id)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{new Date(event.date).toLocaleDateString('it-IT', { dateStyle: 'long' })}</p>
            <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-50">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tipo: {event.type}
              </span>
            </div>
          </div>
        ))}
        {state.events.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400">Nessuna scadenza futura pianificata.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Aggiungi Evento</h3>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titolo</label>
                <input 
                  required
                  type="text" 
                  value={eventData.title}
                  onChange={e => setEventData({...eventData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <input 
                    required
                    type="date" 
                    value={eventData.date}
                    onChange={e => setEventData({...eventData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <select 
                    value={eventData.type}
                    onChange={e => setEventData({...eventData, type: e.target.value as any})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Deadline">Scadenza</option>
                    <option value="Maintenance">Manutenzione</option>
                    <option value="Meeting">Assemblea</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrizione</label>
                <textarea 
                  rows={3}
                  value={eventData.description}
                  onChange={e => setEventData({...eventData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">Annulla</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl shadow-lg font-bold">Aggiungi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
