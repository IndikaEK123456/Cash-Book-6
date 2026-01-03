
import React from 'react';
import { DeviceType } from '../types';

interface HeaderProps {
  date: string;
  rates: { usd: number; euro: number };
  onToggleHistory: () => void;
  showHistory: boolean;
  deviceType: DeviceType;
  syncStatus: string;
  myId: string;
  onShowPairing: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  date, rates, onToggleHistory, showHistory, deviceType, syncStatus, myId, onShowPairing 
}) => {
  const isEditor = deviceType === 'laptop';

  return (
    <header className="bg-slate-900 text-white p-6 rounded-b-3xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-yellow-400">
            SHIVAS BEACH CABANAS
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-slate-400 font-semibold">{date}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
              isEditor ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {deviceType} {isEditor ? 'Editor' : 'Viewer'}
            </span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${syncStatus.includes('Connected') ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
              <span className="text-[10px] text-slate-400 font-bold uppercase">{syncStatus}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {isEditor ? (
             <div className="bg-slate-800 border border-blue-500/30 px-3 py-1.5 rounded-lg">
                <p className="text-[9px] text-blue-400 font-black uppercase">Pairing ID for Mobiles:</p>
                <p className="text-sm font-mono font-bold tracking-wider">{myId}</p>
             </div>
          ) : (
             <button 
                onClick={onShowPairing}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-4 py-2 rounded-lg"
             >
                PAIR WITH LAPTOP
             </button>
          )}

          <div className="bg-slate-800 px-4 py-2 rounded-xl flex gap-4 text-sm font-bold border border-slate-700">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase">USD Rate</span>
              <span className="text-blue-400">Rs {rates.usd}</span>
            </div>
            <div className="flex flex-col border-l border-slate-700 pl-4">
              <span className="text-slate-400 text-[10px] uppercase">EUR Rate</span>
              <span className="text-pink-400">Rs {rates.euro}</span>
            </div>
          </div>
          
          <button 
            onClick={onToggleHistory}
            className={`p-3 rounded-xl transition-all ${
              showHistory ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {showHistory ? 'View Today' : 'History'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
