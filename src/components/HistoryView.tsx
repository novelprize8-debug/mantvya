import React, { useState } from 'react';
import { ReflectionDoc, ReflectionMode } from '../types';
import { 
  Search, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  BookOpen, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface HistoryViewProps {
  reflections: ReflectionDoc[];
  onOpenReflection: (reflection: ReflectionDoc) => void;
  onDeleteReflection: (id: string) => void;
  onBackToDashboard: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  reflections,
  onOpenReflection,
  onDeleteReflection,
  onBackToDashboard,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const filtered = reflections.filter((ref) => {
    const matchesSearch =
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.initialPrompt && ref.initialPrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ref.messages[0] && ref.messages[0].content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = selectedMode === 'all' || ref.mode === selectedMode;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
        <div>
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center space-x-1 text-xs font-medium text-stone-500 hover:text-stone-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <h1 className="font-serif text-3xl font-medium text-stone-900 tracking-tight">
            Reflection Archive
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Your private history of analyzed experiences, examined assumptions, and structured insights.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reflections..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>
      </div>

      {/* Mode Filter Badges */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-6 text-xs">
        <span className="text-stone-400 font-mono text-[11px] uppercase mr-1">Filter:</span>
        {['all', 'understand', 'reality-check', 'decision', 'learn', 'process'].map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`px-3 py-1 rounded-full border text-xs font-medium capitalize cursor-pointer transition-colors ${
              selectedMode === mode
                ? 'bg-stone-900 text-stone-50 border-stone-900'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            {mode === 'all' ? 'All Modes' : mode}
          </button>
        ))}
      </div>

      {/* Reflections Grid/List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/50">
          <BookOpen className="w-8 h-8 mx-auto text-stone-400 mb-2" />
          <p className="font-serif text-base text-stone-800 font-medium">No reflections match your search</p>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search keywords or mode filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ref) => (
            <div
              key={ref.id}
              onClick={() => onOpenReflection(ref)}
              className="p-5 rounded-xl border border-stone-200/80 bg-white hover:border-stone-400/80 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-xs"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
                    {ref.mode}
                  </span>
                  <span className="text-xs text-stone-400 font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(ref.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {ref.status === 'completed' && (
                    <span className="text-[11px] font-medium text-emerald-700 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Synthesized
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900 group-hover:text-stone-800">
                  {ref.title || 'Untitled Reflection'}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-1 mt-1">
                  {ref.initialPrompt || (ref.messages[0] ? ref.messages[0].content : 'No prompt recorded')}
                </p>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Permanently delete this reflection from your private vault?')) {
                      onDeleteReflection(ref.id);
                    }
                  }}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-50 transition-colors"
                  title="Delete from archive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-900 group-hover:text-stone-50 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
