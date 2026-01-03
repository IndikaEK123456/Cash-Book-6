
import React, { useState } from 'react';
import { DailyArchive } from '../types';

interface HistoryViewProps {
  history: DailyArchive[];
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClose }) => {
  const [selectedDay, setSelectedDay] = useState<DailyArchive | null>(null);

  if (selectedDay) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button 
          onClick={() => setSelectedDay(null)}
          className="flex items-center gap-2 text-slate-600 font-bold hover:text-slate-900 mb-4"
        >
          ← Back to History List
        </button>
        
        <div className="bg-slate-900 text-white p-6 rounded-2xl">
          <h2 className="text-xl font-black">Archive: {selectedDay.date}</h2>
          <p className="text-emerald-400 font-black text-2xl mt-2">Closing Balance: Rs {selectedDay.finalBalance.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-black text-slate-800 uppercase text-xs mb-3 border-b border-slate-100 pb-2">Out Party Details</h3>
            <div className="space-y-2">
              {selectedDay.data.outPartyEntries.map(e => (
                <div key={e.id} className="flex justify-between text-sm">
                  <span className="text-slate-500">#{e.index} {e.method}</span>
                  <span className="font-bold">Rs {e.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h3 className="font-black text-slate-800 uppercase text-xs mb-3 border-b border-slate-100 pb-2">Main Log Entries</h3>
            <div className="space-y-2">
              {selectedDay.data.mainEntries.map(e => (
                <div key={e.id} className="border-b border-slate-50 pb-2">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>RM {e.roomNo} - {e.description}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="text-blue-600">IN: {e.cashIn}</span>
                    <span className="text-red-600">OUT: {e.cashOut}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">ARCHIVED RECORDS</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900">Close</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {history.length > 0 ? (
          history.map((day, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedDay(day)}
              className="bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-900 transition-all text-left group shadow-sm"
            >
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{day.date}</p>
              <p className="text-xl font-black text-slate-900 group-hover:text-slate-900">Rs {day.finalBalance.toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">{day.data.mainEntries.length} Entries</span>
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No historical data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
