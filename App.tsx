
import React, { useState } from 'react';
import { 
  WalletState, 
  TransactionRecord
} from './types';
import { midnightService } from './services/midnightService';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isShielded, setIsShielded] = useState(true);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const state = await midnightService.connectWallet();

      console.log('state', state);

      setWallet(state);
    } catch (err) {
      // todo: console.error
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount || !recipient) return;

    setLoading(true);
    try {
      const tx = await midnightService.transfer(
        wallet.address, 
        recipient, 
        parseFloat(amount), 
        isShielded,
        (stage) => {
          setCurrentStage(stage);
        }
      );
      setTxHistory(prev => [tx, ...prev]);
      
      setWallet(prev => prev ? {
        ...prev,
        unshieldedBalance: isShielded ? prev.unshieldedBalance : prev.unshieldedBalance - parseFloat(amount),
        shieldedBalance: isShielded ? prev.shieldedBalance - parseFloat(amount) : prev.shieldedBalance
      } : null);

      setAmount('');
      setRecipient('');
    } catch (err) {
      // todo: console.error
    } finally {
      setLoading(false);
      setCurrentStage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i className="fas fa-moon text-white"></i>
            </div>
            <h1 className="font-bold text-lg tracking-tight">Midnight Wallet <span className="text-indigo-500 text-xs font-mono ml-2">v1.0-alpha</span></h1>
          </div>
          
          <button
            onClick={wallet ? () => setWallet(null) : connectWallet}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              wallet 
              ? 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white' 
              : 'bg-white text-black hover:bg-zinc-200'
            }`}
          >
            {loading && !currentStage ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {wallet ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Wallet Overview & Send */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#121212] to-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-shield-halved text-6xl"></i>
              </div>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Shielded Balance</p>
              <h2 className="text-4xl font-mono font-bold tracking-tighter">
                {wallet ? wallet.shieldedBalance.toLocaleString() : '0.00'} <span className="text-sm text-zinc-600">DUST</span>
              </h2>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Unshielded Balance</p>
              <h2 className="text-4xl font-mono font-bold tracking-tighter">
                {wallet ? wallet.unshieldedBalance.toLocaleString() : '0.00'} <span className="text-sm text-zinc-700">DUST</span>
              </h2>
            </div>
          </div>

          {/* Transfer Interface */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Send Assets</h3>
              <div className="flex bg-zinc-900 p-1 rounded-xl">
                <button 
                  onClick={() => setIsShielded(true)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${isShielded ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  Shielded
                </button>
                <button 
                  onClick={() => setIsShielded(false)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!isShielded ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                  Public
                </button>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Recipient Address</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="midnight1..."
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">DUST</span>
                  </div>
                </div>
              </div>

              {currentStage && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-3">
                  <i className="fas fa-circle-notch fa-spin text-indigo-500"></i>
                  <p className="text-xs text-indigo-300 font-mono italic">{currentStage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!wallet || loading}
                className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : 'Send Transaction'}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Recent Activity</h3>
            {txHistory.length === 0 ? (
              <div className="p-12 text-center bg-[#0a0a0a] border border-dashed border-white/5 rounded-3xl text-zinc-600 text-sm">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {txHistory.map(tx => (
                  <div key={tx.id} className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'Shielded' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        <i className={`fas ${tx.type === 'Shielded' ? 'fa-user-secret' : 'fa-arrow-up'}`}></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold">{tx.type} Payment</p>
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{tx.hash.substring(0, 16)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-zinc-200">-{tx.amount} DUST</p>
                      <p className="text-[10px] text-zinc-600 uppercase">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
