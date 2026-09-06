import React from 'react';
import { Eye, GitCommit, AlertTriangle } from 'lucide-react';

interface LensesPanelProps {
  widerLens?: string | null;
  tensionLens?: string | null;
  complexityCheck?: string | null;
}

export const LensesPanel: React.FC<LensesPanelProps> = ({
  widerLens,
  tensionLens,
  complexityCheck,
}) => {
  if (!widerLens && !tensionLens && !complexityCheck) {
    return null;
  }

  return (
    <div className="space-y-3 my-3">
      {/* Feature 3: Wider Lens (Observer Perspective) */}
      {widerLens && (
        <div className="p-4 rounded-xl border border-stone-200/90 bg-stone-100/60 text-stone-800 text-xs sm:text-sm leading-relaxed shadow-2xs">
          <div className="flex items-center space-x-2 text-stone-700 font-semibold mb-2">
            <Eye className="w-4 h-4 text-stone-600" />
            <span className="font-serif text-sm">Wider Lens — The Outside Observer</span>
          </div>
          <p className="font-serif italic text-stone-700 pl-3 border-l-2 border-stone-300">
            {widerLens}
          </p>
        </div>
      )}

      {/* Feature 4: Tension Lens (Competing Values) */}
      {tensionLens && (
        <div className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/40 text-stone-800 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center space-x-2 text-amber-900 font-semibold mb-1.5">
            <GitCommit className="w-4 h-4 text-amber-700" />
            <span className="font-serif text-sm">Tension Lens — Competing Values</span>
          </div>
          <p className="text-stone-700 pl-3 border-l-2 border-amber-300">
            {tensionLens}
          </p>
        </div>
      )}

      {/* Feature 5: Complexity Check (Execution vs Planning) */}
      {complexityCheck && (
        <div className="p-4 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs sm:text-sm leading-relaxed shadow-2xs">
          <div className="flex items-center space-x-2 text-stone-800 font-semibold mb-1.5">
            <AlertTriangle className="w-4 h-4 text-stone-700" />
            <span className="font-serif text-sm">Complexity Check</span>
          </div>
          <p className="text-stone-600 pl-3 border-l-2 border-stone-400 font-medium">
            {complexityCheck}
          </p>
        </div>
      )}
    </div>
  );
};
