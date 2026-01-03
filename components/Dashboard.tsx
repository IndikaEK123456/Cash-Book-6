
import React from 'react';
import { CashBookData, PaymentMethod, MainSectionEntry, OutPartyEntry } from '../types';
import { calculateTotals } from '../App';

interface DashboardProps {
  data: CashBookData;
  isEditor: boolean;
  onUpdateOutParty: (id: string, amount: number, method: PaymentMethod) => void;
  onAddOutParty: () => void;
  onUpdateMain: (id: string, updates: Partial<MainSectionEntry>) => void;
  onAddMain: () => void;
  onDayEnd: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  data, isEditor, onUpdateOutParty, onAddOutParty, onUpdateMain, onAddMain 
}) => {
  const totals = calculateTotals(data);

  return (
    <div className="space-y-12">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl">
          <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">CASH IN TOTAL</p>
          <p className="text-4xl font-black text-blue-900">Rs {totals.mainCashIn.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl">
          <p className="text-red-600 font-bold text-xs uppercase tracking-wider mb-1">CASH OUT TOTAL</p>
          <p className="text-4xl font-black text-red-900">Rs {totals.mainCashOut.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-3xl ring-4 ring-emerald-100 ring-offset-2">
          <p className="text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">FINAL BALANCE</p>
          <p className="text-4xl font-black text-emerald-900">Rs {totals.finalBalance.toLocaleString()}</p>
        </div>
      </section>

      {/* Out Party Section */}
      <section>
        <div className="flex justify-between items-end mb-4 border-b-2 border-slate-200 pb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800">OUT PARTY SECTION</h2>
            <p className="text-slate-500 text-sm font-medium">External settlements tracking</p>
          </div>
          {isEditor && (
            <button 
              onClick={onAddOutParty}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              + ADD ENTRY
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 overflow-x-auto bg-white rounded-2xl border border-slate-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-200">
                  <th className="px-4 py-3 w-16">#</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3 text-right">Amount (Rs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.outPartyEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-400">{entry.index}</td>
                    <td className="px-4 py-3">
                      {isEditor ? (
                        <select 
                          value={entry.method}
                          onChange={(e) => onUpdateOutParty(entry.id, entry.amount, e.target.value as PaymentMethod)}
                          className={`font-black uppercase text-xs p-1 rounded-md border-0 bg-transparent cursor-pointer ${getMethodColor(entry.method)}`}
                        >
                          <option value={PaymentMethod.CASH}>CASH</option>
                          <option value={PaymentMethod.CARD}>CARD</option>
                          <option value={PaymentMethod.PAYPAL}>PAY PAL</option>
                        </select>
                      ) : (
                        <span className={`font-black uppercase text-xs ${getMethodColor(entry.method)}`}>
                          {entry.method}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditor ? (
                        <input 
                          type="number"
                          value={entry.amount || ''}
                          onChange={(e) => onUpdateOutParty(entry.id, Number(e.target.value), entry.method)}
                          placeholder="0"
                          className="w-32 text-right font-black text-slate-900 bg-transparent border-b border-slate-200 focus:border-slate-900 py-1"
                        />
                      ) : (
                        <span className="font-black text-slate-900">
                          {entry.amount > 0 ? entry.amount.toLocaleString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {data.outPartyEntries.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic text-sm">No entries for today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Out Party Totals</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600">CASH</span>
                  <span className="font-black text-slate-900">Rs {totals.outPartyCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-yellow-600">CARD</span>
                  <span className="font-black text-slate-900">Rs {totals.outPartyCard.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-600">PAY PAL</span>
                  <span className="font-black text-slate-900">Rs {totals.outPartyPaypal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section>
        <div className="flex justify-between items-end mb-4 border-b-2 border-slate-200 pb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-800">MAIN SECTION</h2>
            <p className="text-slate-500 text-sm font-medium">Daily operations log</p>
          </div>
          {isEditor && (
            <button 
              onClick={onAddMain}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              + ADD MAIN ENTRY
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-200">
                  <th className="px-4 py-3 w-20">Room</th>
                  <th className="px-4 py-3 min-w-[300px]">Description</th>
                  <th className="px-4 py-3 w-32">Method</th>
                  <th className="px-4 py-3 text-right min-w-[150px] bg-blue-50/50">Cash In (Rs)</th>
                  <th className="px-4 py-3 text-right min-w-[150px] bg-red-50/50">Cash Out (Rs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
                {/* Opening Balance Row */}
                <tr className="bg-emerald-50/30">
                  <td className="px-4 py-3">---</td>
                  <td className="px-4 py-3 text-emerald-800 italic uppercase text-xs">Opening Balance Brought Forward</td>
                  <td className="px-4 py-3 font-black text-[10px] text-slate-400 uppercase">System</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">Rs {data.openingBalance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-300">---</td>
                </tr>

                {data.mainEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      {isEditor ? (
                        <input 
                          type="text" 
                          value={entry.roomNo} 
                          onChange={(e) => onUpdateMain(entry.id, { roomNo: e.target.value })}
                          className="w-full bg-transparent border-b border-slate-200 focus:border-slate-900 font-black"
                          placeholder="No"
                        />
                      ) : entry.roomNo}
                    </td>
                    <td className="px-4 py-3">
                      {isEditor ? (
                        <input 
                          type="text" 
                          value={entry.description} 
                          onChange={(e) => onUpdateMain(entry.id, { description: e.target.value })}
                          className="w-full bg-transparent border-b border-slate-200 focus:border-slate-900 font-bold"
                          placeholder="Entry details..."
                        />
                      ) : entry.description}
                    </td>
                    <td className="px-4 py-3">
                      {isEditor ? (
                        <select 
                          value={entry.method}
                          onChange={(e) => onUpdateMain(entry.id, { method: e.target.value as PaymentMethod })}
                          className={`font-black uppercase text-[10px] p-1 rounded-md border border-slate-200 bg-white cursor-pointer ${getMethodColor(entry.method)}`}
                        >
                          <option value={PaymentMethod.CASH}>CASH</option>
                          <option value={PaymentMethod.CARD}>CARD</option>
                          <option value={PaymentMethod.PAYPAL}>PAY PAL</option>
                        </select>
                      ) : (
                        <span className={`font-black uppercase text-[10px] ${getMethodColor(entry.method)}`}>
                          {entry.method}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right bg-blue-50/20">
                      {isEditor ? (
                        <input 
                          type="number" 
                          value={entry.cashIn || ''} 
                          onChange={(e) => onUpdateMain(entry.id, { cashIn: Number(e.target.value) })}
                          className="w-full text-right bg-transparent border-b border-slate-200 focus:border-blue-500 font-black text-blue-800"
                          placeholder="0"
                        />
                      ) : (entry.cashIn > 0 ? entry.cashIn.toLocaleString() : '')}
                    </td>
                    <td className="px-4 py-3 text-right bg-red-50/20">
                      {isEditor ? (
                        <input 
                          type="number" 
                          value={entry.cashOut || ''} 
                          onChange={(e) => onUpdateMain(entry.id, { cashOut: Number(e.target.value) })}
                          className="w-full text-right bg-transparent border-b border-slate-200 focus:border-red-500 font-black text-red-800"
                          placeholder="0"
                        />
                      ) : (entry.cashOut > 0 ? entry.cashOut.toLocaleString() : '')}
                    </td>
                  </tr>
                ))}
                
                {/* Secondary Totals Helper Information */}
                <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                  <td colSpan={3} className="px-4 py-4 text-right font-black text-slate-500 text-xs uppercase">
                    Non-Cash Settlements (Auto-balanced to Out)
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="space-y-1">
                      <div className="text-[10px] text-yellow-600">CARD TOTAL: {totals.totalCard.toLocaleString()}</div>
                      <div className="text-[10px] text-purple-600">PAY PAL TOTAL: {totals.totalPaypal.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[10px] text-slate-400 italic">Included in Final Cash Out</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

const getMethodColor = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH: return 'text-blue-600';
    case PaymentMethod.CARD: return 'text-yellow-600';
    case PaymentMethod.PAYPAL: return 'text-purple-600';
    default: return 'text-slate-600';
  }
};

export default Dashboard;
