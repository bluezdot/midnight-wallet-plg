
import React, { useState, useCallback, useEffect } from 'react';
import { 
  WalletState, 
  TransactionRecord, 
  LogEntry, 
  NetworkType, 
  TransactionStatus 
} from './types';
import { midnightService } from './services/midnightService';
import { ConsoleLog } from './components/ConsoleLog';
import { GeminiAssistant } from './components/GeminiAssistant';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Transfer Form State
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isShielded, setIsShielded] = useState(false);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: Date.now(), message, level }]);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    addLog('Initiating wallet connection...');
    try {
      const state = await midnightService.connectWallet();
      setWallet(state);
      addLog(`Wallet connected: ${state.address}`, 'success');
      addLog(`Shielded Address: ${state.shieldedAddress}`, 'info');
    } catch (err) {
      addLog('Failed to connect wallet', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !amount || !recipient) return;

    setLoading(true);
    addLog(`Initiating ${isShielded ? 'shielded' : 'unshielded'} transfer...`);
    
    try {
      const tx = await midnightService.transfer(
        wallet.address, 
        recipient, 
        parseFloat(amount), 
        isShielded
      );
      setTxHistory(prev => [tx, ...prev]);
      addLog(`Transaction success: ${tx.hash.substring(0, 10)}...`, 'success');
      
      // Update local balance simulation
      setWallet(prev => prev ? {
        ...prev,
        unshieldedBalance: isShielded ? prev.unshieldedBalance : prev.unshieldedBalance - parseFloat(amount),
        shieldedBalance: isShielded ? prev.shieldedBalance - parseFloat(amount) : prev.shieldedBalance
      } : null);

      setAmount('');
      setRecipient('');
    } catch (err) {
      addLog('Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!wallet) return;
    addLog('Refreshing balances from network...');
    setLoading(true);
    try {
      const uBal = await midnightService.getBalance(wallet.address, false);
      const sBal = await midnightService.getBalance(wallet.shieldedAddress, true);
      setWallet(prev => prev ? { ...prev, unshieldedBalance: uBal, shieldedBalance: sBal } : null);
      addLog('Balances updated', 'success');
    } catch (err) {
      addLog('Refresh failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center midnight-glow">
              <i className="fas fa-moon text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Midnight DevKit</h1>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">v1.0.0-alpha</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {wallet && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-gray-500 uppercase">Current Network</span>
                <span className="text-xs font-semibold text-emerald-400">{wallet.network}</span>
              </div>
            )}
            <button
              onClick={wallet ? () => setWallet(null) : connectWallet}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                wallet 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
              }`}
            >
              {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
              {wallet ? 'Disconnect' : 'Connect Devnet'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Wallet & Controls */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="midnight-gradient p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-eye-slash text-6xl"></i>
              </div>
              <p className="text-indigo-300 text-sm font-medium mb-1">Shielded Balance (Private)</p>
              <h2 className="text-3xl font-bold font-mono tracking-tighter">
                {wallet ? wallet.shieldedBalance.toLocaleString() : '---'} <span className="text-xs text-indigo-400">DUST</span>
              </h2>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-mono">
                <i className="fas fa-shield-alt"></i>
                <span>ZK-PROOFS ENABLED</span>
              </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fas fa-globe text-6xl"></i>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Unshielded Balance (Public)</p>
              <h2 className="text-3xl font-bold font-mono tracking-tighter">
                {wallet ? wallet.unshieldedBalance.toLocaleString() : '---'} <span className="text-xs text-gray-500">DUST</span>
              </h2>
              <button 
                onClick={refreshBalance}
                className="mt-4 text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
              >
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                Refresh from Node
              </button>
            </div>
          </div>

          {/* Transfer Interface */}
          <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 bg-[#161616] flex items-center justify-between">
              <h3 className="font-semibold text-gray-200">Token Operations</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsShielded(false)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!isShielded ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Unshielded
                </button>
                <button 
                  onClick={() => setIsShielded(true)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${isShielded ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  Shielded
                </button>
              </div>
            </div>
            
            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient Address</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={isShielded ? "Shielded address (mn1...)" : "Unshielded address (midnight1...)"}
                    className="w-full bg-[#050505] border border-gray-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-10"
                  />
                  <i className="fas fa-at absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"></i>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#050505] border border-gray-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-10 font-mono"
                  />
                  <i className="fas fa-coins absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"></i>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">DUST</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!wallet || loading}
                className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all shadow-lg ${
                  isShielded 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' 
                  : 'bg-white hover:bg-gray-100 text-black shadow-white/5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? <i className="fas fa-cog animate-spin mr-2"></i> : null}
                {isShielded ? 'Execute Shielded Transfer' : 'Execute Public Transfer'}
              </button>
            </form>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-400 uppercase text-xs tracking-widest px-2">History</h3>
            <div className="space-y-2">
              {txHistory.length === 0 ? (
                <div className="p-8 text-center bg-[#0a0a0a] rounded-xl border border-gray-800 border-dashed">
                  <p className="text-gray-600 text-sm">No transactions yet. Start testing!</p>
                </div>
              ) : (
                txHistory.map(tx => (
                  <div key={tx.id} className="bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl flex items-center justify-between hover:border-gray-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'Shielded' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                        <i className={`fas ${tx.type === 'Shielded' ? 'fa-mask' : 'fa-paper-plane'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{tx.type} Transfer</span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">Success</span>
                        </div>
                        <p className="text-xs text-gray-500 mono mt-0.5">Hash: {tx.hash.substring(0, 16)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-100">-{tx.amount} DUST</p>
                      <p className="text-[10px] text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Console & AI */}
        <div className="lg:col-span-4 space-y-6">
          <ConsoleLog logs={logs} />
          
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Script Snippet</h3>
            <div className="bg-[#050505] rounded-lg p-4 font-mono text-[11px] leading-relaxed border border-gray-800">
              {/* Fix: Wrapped template strings in curly braces and string literals to prevent TypeScript name resolution errors for variables in static code examples */}
              <span className="text-purple-400">const</span> balance = <span className="text-blue-400">await</span> midnight.getBalance(addr);<br/>
              <span className="text-gray-500">// Run with ts-node</span><br/>
              <span className="text-emerald-400">console</span>.<span className="text-yellow-400">log</span>(<span className="text-orange-400">{"`Balance: ${balance}`"}</span>);
            </div>
            <p className="mt-3 text-[10px] text-gray-500 italic">Use the provided test-script.ts to run CLI tests using ts-node.</p>
          </div>

          <GeminiAssistant />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 mt-12 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">Built for Midnight Network Developers • All transactions are simulated for testing purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
