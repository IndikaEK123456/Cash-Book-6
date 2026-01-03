
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  DeviceState, 
  DeviceType, 
  PaymentMethod, 
  OutPartyEntry, 
  MainSectionEntry, 
  CashBookData 
} from './types';
import { syncService } from './services/syncService';
import { fetchExchangeRates } from './services/gemini';

import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';

const AppContent: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.slice(1);
  const deviceType: DeviceType = (path === 'android' || path === 'iphone') ? path : 'laptop';
  const isEditor = deviceType === 'laptop';

  const [state, setState] = useState<DeviceState>(syncService.loadLocalState());
  const [showHistory, setShowHistory] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Initializing...');
  const [laptopIdInput, setLaptopIdInput] = useState('');
  const [showPairing, setShowPairing] = useState(false);

  useEffect(() => {
    syncService.subscribe(
      (newState) => setState(newState),
      (status) => setSyncStatus(status)
    );

    // Initial rates fetch only on laptop
    if (isEditor) {
      const getRates = async () => {
        const rates = await fetchExchangeRates();
        setState(prev => {
          const next = { ...prev, rates };
          syncService.broadcastState(next);
          return next;
        });
      };
      getRates();
    }
  }, [isEditor]);

  const updateState = (updater: (prev: DeviceState) => DeviceState) => {
    if (!isEditor) return;
    setState(prev => {
      const next = updater(prev);
      syncService.broadcastState(next);
      return next;
    });
  };

  const handlePair = () => {
    if (laptopIdInput.trim()) {
      syncService.connectToLaptop(laptopIdInput.trim());
      setShowPairing(false);
    }
  };

  const handleAddOutParty = () => {
    updateState(prev => ({
      ...prev,
      currentData: {
        ...prev.currentData,
        outPartyEntries: [
          ...prev.currentData.outPartyEntries,
          {
            id: crypto.randomUUID(),
            index: prev.currentData.outPartyEntries.length + 1,
            method: PaymentMethod.CASH,
            amount: 0
          }
        ]
      }
    }));
  };

  const handleUpdateOutParty = (id: string, amount: number, method: PaymentMethod) => {
    updateState(prev => ({
      ...prev,
      currentData: {
        ...prev.currentData,
        outPartyEntries: prev.currentData.outPartyEntries.map(e => 
          e.id === id ? { ...e, amount, method } : e
        )
      }
    }));
  };

  const handleAddMainEntry = () => {
    updateState(prev => ({
      ...prev,
      currentData: {
        ...prev.currentData,
        mainEntries: [
          ...prev.currentData.mainEntries,
          {
            id: crypto.randomUUID(),
            roomNo: '',
            description: '',
            method: PaymentMethod.CASH,
            cashIn: 0,
            cashOut: 0
          }
        ]
      }
    }));
  };

  const handleUpdateMainEntry = (id: string, updates: Partial<MainSectionEntry>) => {
    updateState(prev => ({
      ...prev,
      currentData: {
        ...prev.currentData,
        mainEntries: prev.currentData.mainEntries.map(e => 
          e.id === id ? { ...e, ...updates } : e
        )
      }
    }));
  };

  const handleDayEnd = () => {
    if (!window.confirm("End the day and archive data?")) return;
    const totals = calculateTotals(state.currentData);
    const finalBalance = totals.finalBalance;

    updateState(prev => {
      const archive = {
        date: prev.currentData.date,
        data: { ...prev.currentData },
        finalBalance: finalBalance
      };
      return {
        ...prev,
        history: [archive, ...prev.history],
        currentData: {
          date: new Date().toLocaleDateString(),
          outPartyEntries: [],
          mainEntries: [],
          openingBalance: finalBalance
        }
      };
    });
  };

  return (
    <div className="min-h-screen pb-20 max-w-6xl mx-auto shadow-xl bg-white relative">
      <Header 
        date={state.currentData.date} 
        rates={state.rates} 
        onToggleHistory={() => setShowHistory(!showHistory)}
        showHistory={showHistory}
        deviceType={deviceType}
        syncStatus={syncStatus}
        myId={syncService.getMyId()}
        onShowPairing={() => setShowPairing(true)}
      />
      
      <main className="p-4 md:p-6 space-y-8">
        {showHistory ? (
          <HistoryView history={state.history} onClose={() => setShowHistory(false)} />
        ) : (
          <Dashboard 
            data={state.currentData}
            isEditor={isEditor}
            onUpdateOutParty={handleUpdateOutParty}
            onAddOutParty={handleAddOutParty}
            onUpdateMain={handleUpdateMainEntry}
            onAddMain={handleAddMainEntry}
            onDayEnd={handleDayEnd}
          />
        )}
      </main>

      {/* Pairing Modal */}
      {showPairing && !isEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black mb-2">Connect to Laptop</h3>
            <p className="text-slate-500 text-sm mb-6">Enter the Pairing ID shown on your Laptop screen.</p>
            <input 
              type="text" 
              value={laptopIdInput}
              onChange={(e) => setLaptopIdInput(e.target.value)}
              placeholder="SHIVAS-XXXX-XXXX"
              className="w-full bg-slate-100 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-center text-lg mb-4"
            />
            <div className="flex gap-3">
              <button 
                onClick={handlePair}
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl"
              >
                Connect Now
              </button>
              <button 
                onClick={() => setShowPairing(false)}
                className="px-4 py-3 text-slate-400 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditor && !showHistory && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 flex justify-center z-10">
          <button 
            onClick={handleDayEnd}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-12 rounded-full shadow-lg transition-transform active:scale-95"
          >
            DAY END
          </button>
        </div>
      )}
    </div>
  );
};

export const calculateTotals = (data: CashBookData) => {
  const outPartyCash = data.outPartyEntries
    .filter(e => e.method === PaymentMethod.CASH)
    .reduce((sum, e) => sum + e.amount, 0);
  const outPartyCard = data.outPartyEntries
    .filter(e => e.method === PaymentMethod.CARD)
    .reduce((sum, e) => sum + e.amount, 0);
  const outPartyPaypal = data.outPartyEntries
    .filter(e => e.method === PaymentMethod.PAYPAL)
    .reduce((sum, e) => sum + e.amount, 0);

  const mainSectionCard = data.mainEntries
    .filter(e => e.method === PaymentMethod.CARD)
    .reduce((sum, e) => sum + e.cashIn, 0);
  const mainSectionPaypal = data.mainEntries
    .filter(e => e.method === PaymentMethod.PAYPAL)
    .reduce((sum, e) => sum + e.cashIn, 0);

  const totalCard = outPartyCard + mainSectionCard;
  const totalPaypal = outPartyPaypal + mainSectionPaypal;
  const outPartyTotal = outPartyCash + outPartyCard + outPartyPaypal;
  const additionalCashOut = totalCard + totalPaypal;

  const mainCashIn = data.mainEntries.reduce((sum, e) => sum + e.cashIn, 0) + outPartyTotal + data.openingBalance;
  const mainCashOut = data.mainEntries.reduce((sum, e) => sum + e.cashOut, 0) + additionalCashOut;

  return {
    outPartyCash,
    outPartyCard,
    outPartyPaypal,
    totalCard,
    totalPaypal,
    mainCashIn,
    mainCashOut,
    finalBalance: mainCashIn - mainCashOut
  };
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/laptop" replace />} />
        <Route path="/laptop" element={<AppContent />} />
        <Route path="/android" element={<AppContent />} />
        <Route path="/iphone" element={<AppContent />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
