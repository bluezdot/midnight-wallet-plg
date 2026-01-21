
import React, { useState, useCallback } from 'react';
import { 
  WalletState, 
  TransactionRecord, 
  LogEntry, 
  NetworkType 
} from './types';
import { midnightService } from './services/midnightService';
import { ConsoleLog } from './components/ConsoleLog';
import { GeminiAssistant } from './components/GeminiAssistant';
import { ScriptPlayground } from './components/ScriptPlayground';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isShielded, setIsShielded] = useState(false);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: Date.now(), message, level }]);
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    addLog('Establishing pnpm workspace connection...');
    try {
      const state = await midnightService.connectWallet();
      setWallet(state);
      addLog(`Environment ready. Devnet active.`, 'success');
    } catch (err) {
      addLog('Failed to connect environment', 'error');
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
          addLog(`[pnpm-exec] ${stage}`, 'info');
        }
      );
      setTxHistory(prev => [tx, ...prev]);
      addLog(`Transaction finalized on-chain`, 'success');
      
      setWallet(prev => prev ? {
        ...prev,
        unshieldedBalance: isShielded ? prev.unshieldedBalance : prev.unshieldedBalance - parseFloat(amount),
        shieldedBalance: isShielded ? prev.shieldedBalance - parseFloat(amount) : prev.shieldedBalance
      } : null);

      setAmount('');
      setRecipient('');
    } catch (err) {
      addLog('Execution error in worker', 'error');
    } finally {
      setLoading(false);
      setCurrentStage(null);
    }
  };

  const runScript = async (scriptId: string) => {
    if (!wallet) {
      addLog('Run "pnpm connect" first', 'warn');
      return;
    }
    setLoading(true);
    addLog(`$ pnpm dlx ts-node scripts/${scriptId}.ts`, 'info');
    
    // Giả lập logic script
    if (scriptId === 'balance') {
      const b = await midnightService.getBalance(wallet.address, false);
      addLog(`[Stdout] Current Balance: ${b} DUST`, 'success');
    } else if (scriptId === 'transfer_shielded') {
      await midnightService.transfer(wallet.address, 'mn1_target_test', 10, true, (s) => addLog(`[Stdout] ${s}`));
    } else {
      addLog('[Stdout] Compiling Compact logic...', 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog('[Stdout] Script exit code: 0', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      <nav className="border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center midnight-glow">
              <i className="fas fa-box text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Midnight <span className="text-orange-500">pnpm</span> Lab</h1>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Performance Mode</span>
            </div>
          </div>
          
          <button
            onClick={wallet ? () => setWallet(null) : connectWallet}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
              wallet 
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20'
            }`}
          >
            {loading && !currentStage ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            {wallet ? 'Clean Workspace' : 'Initialize Env'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          
          {currentStage && (
            <div className="bg-orange-600/10 border border-orange-500/30 p-4 rounded-xl flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
              <div>
                <p className="text-sm font-bold text-orange-400 uppercase tracking-widest">pnpm Child Process</p>
                <p className="text-xs text-gray-400 font-mono">{currentStage}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-1">Shielded (Private)</p>
              <h2 className="text-4xl font-bold font-mono tracking-tighter">
                {wallet ? wallet.shieldedBalance.toLocaleString() : '---'} <span className="text-xs text-indigo-400">DUST</span>
              </h2>
            </div>
            <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Unshielded (Public)</p>
              <h2 className="text-4xl font-bold font-mono tracking-tighter">
                {wallet ? wallet.unshieldedBalance.toLocaleString() : '---'} <span className="text-xs text-gray-600">DUST</span>
              </h2>
            </div>
          </div>

          <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 bg-[#161616] flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400">Transaction Lab</h3>
              <div className="flex bg-[#0a0a0a] p-1 rounded-lg">
                <button 
                  onClick={() => setIsShielded(false)}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${!isShielded ? 'bg-gray-800 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Public
                </button>
                <button 
                  onClick={() => setIsShielded(true)}
                  className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${isShielded ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Shielded
                </button>
              </div>
            </div>
            
            <form onSubmit={handleTransfer} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Recipient</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Address..."
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Amount (DUST)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!wallet || loading}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all ${
                  isShielded 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                  : 'bg-white hover:bg-gray-100 text-black'
                } disabled:opacity-20 disabled:cursor-not-allowed`}
              >
                {loading ? 'Executing with pnpm...' : `Finalize ${isShielded ? 'Shielded' : 'Public'} Tx`}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.3em] px-2">Ledger Activity</h3>
            <div className="space-y-3">
              {txHistory.map(tx => (
                <div key={tx.id} className="bg-[#0f0f0f] border border-gray-800 p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'Shielded' ? 'bg-orange-900/30 text-orange-400' : 'bg-gray-800 text-gray-400'}`}>
                      <i className={`fas ${tx.type === 'Shielded' ? 'fa-user-secret' : 'fa-paper-plane'}`}></i>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{tx.type} Tx</span>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{tx.hash.substring(0, 24)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">-{tx.amount} DUST</p>
                    <p className="text-[10px] text-gray-600 font-mono uppercase">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <ScriptPlayground onRun={runScript} isRunning={loading} />
          <ConsoleLog logs={logs} />
          <GeminiAssistant />
        </div>
      </main>
    </div>
  );
};

export default App;
