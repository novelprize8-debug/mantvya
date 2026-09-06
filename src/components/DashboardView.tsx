import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ReflectionDoc, ReflectionMode } from '../types';
import { 
  Compass, 
  HelpCircle, 
  CheckCircle2, 
  Scale, 
  BookOpen, 
  Wind, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  onStartReflection: (mode: ReflectionMode, initialText: string) => void;
  onOpenReflection: (reflection: ReflectionDoc) => void;
  onDeleteReflection: (id: string) => void;
  reflections: ReflectionDoc[];
  loadingReflections: boolean;
}

const MODES: { id: ReflectionMode; label: string; tag: string; description: string; icon: any }[] = [
  {
    id: 'understand',
    label: 'Understand',
    tag: 'Clarity',
    description: 'Deconstruct a situation, recurring pattern, or confusing interaction.',
    icon: Compass,
  },
  {
    id: 'reality-check',
    label: 'Reality Check',
    tag: 'Facts vs Story',
    description: 'Separate what actually happened from what you are telling yourself about it.',
    icon: HelpCircle,
  },
  {
    id: 'decision',
    label: 'Decision',
    tag: 'Trade-offs',
    description: 'Examine competing priorities, identify tensions, and clarify true best interest.',
    icon: Scale,
  },
  {
    id: 'learn',
    label: 'Learn',
    tag: 'Growth',
    description: 'Accountability without humiliation. Extract genuine lessons from a setback.',
    icon: BookOpen,
  },
  {
    id: 'process',
    label: 'Process',
    tag: 'Perspective',
    description: 'Step outside emotional gravity to examine an experience from an observer lens.',
    icon: Wind,
  },
];

const STARTER_PROMPTS = [
  {
    title: 'Presentation Doubts',
    prompt: "I gave a presentation earlier today and I can't shake the feeling that it was a disaster, even though no one said anything negative.",
    mode: 'reality-check' as ReflectionMode,
  },
  {
    title: 'Conflicting Commitments',
    prompt: "I keep committing to exciting new projects, but I feel completely overwhelmed and fragmented by my existing backlog.",
    mode: 'decision' as ReflectionMode,
  },
  {
    title: 'Communication Regret',
    prompt: "I reacted defensively in a meeting this morning. I know I shouldn't have, and now I'm judging myself harshly for it.",
    mode: 'learn' as ReflectionMode,
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartReflection,
  onOpenReflection,
  onDeleteReflection,
  reflections,
  loadingReflections,
}) => {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>('understand');
  const [reflectionInput, setReflectionInput] = useState('');

  const handleBegin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reflectionInput.trim()) return;
    onStartReflection(selectedMode, reflectionInput.trim());
  };

  const handleSelectStarter = (starter: typeof STARTER_PROMPTS[0]) => {
    setSelectedMode(starter.mode);
    setReflectionInput(starter.prompt);
  };

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'there';
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header Greeting */}
      <div className="mb-10">
        <span className="text-xs uppercase tracking-wider text-stone-500 font-medium font-mono">
          {todayFormatted}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mt-1 mb-2 font-medium">
          Good day, {firstName}.
        </h1>
        <p className="text-stone-600 text-base max-w-2xl">
          What is occupying your mind today? Choose an angle or simply write what happened.
        </p>
      </div>

      {/* Start Reflection Box */}
      <div className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs mb-14">
        {/* Mode Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3 font-sans">
            Choose Reflection Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-stone-100' : 'text-stone-500'}`} />
                    <span
                      className={`text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {mode.tag}
                    </span>
                  </div>
                  <span className="text-xs font-semibold leading-tight">{mode.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-stone-500 mt-2.5 font-normal">
            {MODES.find((m) => m.id === selectedMode)?.description}
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={handleBegin}>
          <div className="relative">
            <textarea
              value={reflectionInput}
              onChange={(e) => setReflectionInput(e.target.value)}
              placeholder="Describe what happened, a decision you're pondering, or a conclusion you want to examine..."
              rows={4}
              className="w-full p-4 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 text-sm sm:text-base leading-relaxed resize-none shadow-xs"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-stone-500 italic">
              Mantavya will ask questions to clarify reality, challenge conclusions, and find agency.
            </span>
            <button
              type="submit"
              disabled={!reflectionInput.trim()}
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 font-medium text-sm hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <span>Begin Reflection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Starter Prompts */}
        <div className="mt-8 pt-6 border-t border-stone-200/70">
          <span className="text-xs font-medium uppercase tracking-wider text-stone-400 block mb-3 font-mono">
            Or explore a common scenario
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STARTER_PROMPTS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStarter(starter)}
                className="text-left p-3 rounded-lg border border-stone-200/80 bg-white/60 hover:bg-white hover:border-stone-300 transition-all text-xs text-stone-700 cursor-pointer group"
              >
                <div className="font-semibold text-stone-900 mb-1 flex items-center justify-between">
                  <span>{starter.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                </div>
                <p className="text-stone-500 line-clamp-2 leading-relaxed">
                  {starter.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reflections Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-stone-900 font-medium">Recent Reflections</h2>
          <span className="text-xs text-stone-500 font-mono">
            {reflections.length} {reflections.length === 1 ? 'entry' : 'entries'} in secure vault
          </span>
        </div>

        {loadingReflections ? (
          <div className="p-8 text-center text-stone-400 text-sm">
            Accessing private reflection storage...
          </div>
        ) : reflections.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50/40">
            <BookOpen className="w-8 h-8 mx-auto text-stone-400 mb-3" />
            <h3 className="font-serif text-stone-800 text-base mb-1 font-medium">No reflections recorded yet</h3>
            <p className="text-stone-500 text-xs max-w-sm mx-auto">
              Your conversations are private and protected by Firebase Auth and user-isolated Firestore rules. Begin your first session above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reflections.slice(0, 6).map((ref) => (
              <div
                key={ref.id}
                onClick={() => onOpenReflection(ref)}
                className="p-5 rounded-xl border border-stone-200/80 bg-white hover:border-stone-400/80 transition-all cursor-pointer group relative shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium">
                    {ref.mode}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-stone-400 flex items-center font-mono">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(ref.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to permanently delete this reflection?')) {
                          onDeleteReflection(ref.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete reflection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-base text-stone-900 font-medium line-clamp-1 mb-1.5 group-hover:text-stone-800">
                  {ref.title || 'Untitled Reflection'}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                  {ref.initialPrompt || (ref.messages[0] ? ref.messages[0].content : 'No preview available')}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <span>
                    {ref.status === 'completed' ? (
                      <span className="text-emerald-700 font-medium flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Concluded
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium">In Progress</span>
                    )}
                  </span>
                  <span className="font-medium text-stone-700 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Open <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
