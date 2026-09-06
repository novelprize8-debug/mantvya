import React from 'react';
import { RealityCheckBreakdown } from '../types';
import { HelpCircle, Check, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

interface RealityCheckCardProps {
  data: RealityCheckBreakdown;
}

export const RealityCheckCard: React.FC<RealityCheckCardProps> = ({ data }) => {
  const hasContent =
    (data.facts && data.facts.length > 0) ||
    (data.interpretations && data.interpretations.length > 0) ||
    (data.assumptions && data.assumptions.length > 0);

  if (!hasContent) return null;

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-stone-50/70 p-4.5 sm:p-5 text-stone-800 shadow-2xs">
      <div className="flex items-center space-x-2 mb-3.5 pb-2 border-b border-stone-200/70">
        <SlidersHorizontal className="w-4 h-4 text-stone-700" />
        <span className="font-serif text-sm font-semibold tracking-tight text-stone-900">
          Reality Check — Distangling the Evidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
        {/* Observable Facts */}
        {data.facts && data.facts.length > 0 && (
          <div className="p-3 rounded-lg bg-white border border-stone-200">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
              Observable Facts
            </span>
            <ul className="space-y-1 text-stone-700">
              {data.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-emerald-700 font-bold mr-1.5">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interpretations & Stories */}
        {data.interpretations && data.interpretations.length > 0 && (
          <div className="p-3 rounded-lg bg-white border border-stone-200">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />
              Interpretations & Stories
            </span>
            <ul className="space-y-1 text-stone-700">
              {data.interpretations.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-amber-700 font-bold mr-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumptions */}
        {data.assumptions && data.assumptions.length > 0 && (
          <div className="p-3 rounded-lg bg-white border border-stone-200">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mr-1.5" />
              Assumptions Under Scrutiny
            </span>
            <ul className="space-y-1 text-stone-700">
              {data.assumptions.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-stone-400 font-bold mr-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Control Boundaries */}
        {((data.withinControl && data.withinControl.length > 0) ||
          (data.outsideControl && data.outsideControl.length > 0)) && (
          <div className="p-3 rounded-lg bg-white border border-stone-200">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-500 block mb-1.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mr-1.5" />
              Locus of Control
            </span>
            <div className="space-y-2">
              {data.withinControl && data.withinControl.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-800 block">Within my control:</span>
                  <p className="text-stone-600 pl-2 border-l border-stone-300">
                    {data.withinControl.join(', ')}
                  </p>
                </div>
              )}
              {data.outsideControl && data.outsideControl.length > 0 && (
                <div>
                  <span className="text-[11px] font-semibold text-stone-800 block">Outside my control:</span>
                  <p className="text-stone-500 pl-2 border-l border-stone-200">
                    {data.outsideControl.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
