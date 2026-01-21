
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-emerald-400';
      default: return 'text-blue-300';
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 h-64 overflow-hidden flex flex-col midnight-glow">
      <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400 ml-2 font-mono uppercase tracking-widest">Midnight-Scripts_Log</span>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 mono text-sm scrollbar-thin scrollbar-thumb-gray-800"
      >
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">Waiting for operations...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={getLogStyle(log.level)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
