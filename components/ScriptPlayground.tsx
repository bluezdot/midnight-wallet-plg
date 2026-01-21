
import React, { useState } from 'react';

interface ScriptPlaygroundProps {
  onRun: (scriptName: string) => void;
  isRunning: boolean;
}

export const ScriptPlayground: React.FC<ScriptPlaygroundProps> = ({ onRun, isRunning }) => {
  const scripts = [
    { id: 'balance', name: 'pnpm test:balance', icon: 'fa-wallet' },
    { id: 'transfer_shielded', name: 'pnpm test:shielded', icon: 'fa-user-secret' },
    { id: 'compact_sim', name: 'pnpm exec compact-sim', icon: 'fa-file-code' }
  ];

  return (
    <div className="bg-[#111111] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-gray-800 bg-[#161616] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-box-open text-orange-400 text-xs"></i>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">pnpm Execution Lab</h3>
        </div>
        <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
      </div>
      <div className="p-4 space-y-2">
        {scripts.map(s => (
          <button
            key={s.id}
            disabled={isRunning}
            onClick={() => onRun(s.id)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-gray-800 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <i className={`fas ${s.icon} text-gray-500 group-hover:text-orange-400`}></i>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white font-mono">{s.name}</span>
            </div>
            <i className={`fas ${isRunning ? 'fa-spinner fa-spin' : 'fa-play'} text-[10px] text-gray-600`}></i>
          </button>
        ))}
      </div>
    </div>
  );
};
