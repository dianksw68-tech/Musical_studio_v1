import React, { useState } from 'react';
import { History, Search, Edit2, X, Check, ArrowLeft } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryListProps {
  history: HistoryEntry[];
  onLoadHistory: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
  onUpdateHistory: (id: string, newTitle: string) => void;
  onBack?: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onLoadHistory,
  onDeleteHistory,
  onUpdateHistory,
  onBack
}) => {
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryTitle, setEditingHistoryTitle] = useState('');

  const filteredHistory = history.filter(entry => {
    const search = historySearchTerm.toLowerCase();
    return (entry.inputs.songTitle?.toLowerCase().includes(search) || 
           entry.inputs.storyTheme?.toLowerCase().includes(search));
  });

  return (
    <div className="space-y-6 w-full">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Kembali ke Studio
        </button>
      )}
      <div className="glass-panel p-6 neon-border bg-slate-200/50 dark:bg-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-primary-500"><History size={18} /></div>
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold">Generation History</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search history..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="w-full bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
          </div>
        </div>
        
        {filteredHistory && filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/5 relative group hover:border-primary-500/50 transition-colors flex flex-col h-full text-left">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-[10px] text-slate-500 dark:text-white/40 font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingHistoryId(entry.id);
                        setEditingHistoryTitle(entry.inputs.songTitle || '');
                      }}
                      className="p-1.5 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-md transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteHistory(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                
                {editingHistoryId === entry.id ? (
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingHistoryTitle}
                      onChange={(e) => setEditingHistoryTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateHistory(entry.id, editingHistoryTitle);
                          setEditingHistoryId(null);
                        }
                      }}
                      autoFocus
                      className="flex-1 bg-slate-100 dark:bg-black/60 border border-primary-500/30 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        onUpdateHistory(entry.id, editingHistoryTitle);
                        setEditingHistoryId(null);
                      }}
                      className="p-1.5 bg-primary-500/10 text-primary-500 rounded-md hover:bg-primary-500 hover:text-white transition-colors"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {entry.inputs.songTitle || 'Untitled Song'}
                  </h4>
                )}
                
                <p className="text-xs text-slate-600 dark:text-white/60 line-clamp-2 mb-4 flex-1">
                  {entry.inputs.storyTheme}
                </p>
                
                <button 
                  onClick={() => onLoadHistory(entry)}
                  className="w-full py-2 mt-auto bg-primary-500/10 text-xs font-bold rounded-lg border border-primary-500/30 hover:bg-primary-500 text-primary-600 dark:text-primary-400 hover:text-white transition-colors"
                >
                  Load Inputs & History
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-white/40">
            <History size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">
              {historySearchTerm ? "Tidak ditemukan respons sejarah yang cocok." : "Belum ada history generation."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
