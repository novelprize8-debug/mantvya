import React, { useState } from 'react';
import { StructuredSummary, ReflectionDoc } from '../types';
import { 
  CheckCircle2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Eye, 
  Compass, 
  Lightbulb, 
  RotateCcw,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface StructuredReflectionViewProps {
  reflection: ReflectionDoc;
  onBackToDashboard: () => void;
}

export const StructuredReflectionView: React.FC<StructuredReflectionViewProps> = ({
  reflection,
  onBackToDashboard,
}) => {
  const [copied, setCopied] = useState(false);
  const summary = reflection.structuredSummary;

  if (!summary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-stone-500 mb-4">No structured reflection is recorded for this session.</p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-lg bg-stone-900 text-stone-50 text-xs font-medium cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    const text = `
MANTAVYA STRUCTURED REFLECTION: ${reflection.title}
Date: ${new Date(reflection.updatedAt).toLocaleDateString()}
Mode: ${reflection.mode.toUpperCase()}

[BEFORE / NOW]
Before: ${summary.before}
Now: ${summary.now}

[WHAT HAPPENED]
${summary.whatHappened}

[WHAT I INITIALLY THOUGHT]
${summary.whatInitiallyThought}

[WHAT I MAY HAVE ASSUMED]
${summary.whatMayHaveAssumed}

[WIDER LENS (OBSERVER PERSPECTIVE)]
${summary.widerLens}

[WHAT BECAME CLEARER]
${summary.whatBecameClearer}

[WHAT I LEARNED]
${summary.whatLearned}

[WHAT I CAN CHANGE]
${summary.whatCanChange}

[TAKEAWAY TO REMEMBER]
${summary.whatToRemember}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const text = `
# ${reflection.title || 'Mantavya Reflection'}
*Mode: ${reflection.mode} | Concluded: ${new Date(reflection.updatedAt).toLocaleDateString()}*

---

### Before vs Now
- **Before:** ${summary.before}
- **Now:** ${summary.now}

---

### 1. What Happened
${summary.whatHappened}

### 2. What I Initially Thought
${summary.whatInitiallyThought}

### 3. What I May Have Assumed
${summary.whatMayHaveAssumed}

### 4. Wider Lens (Observer View)
${summary.widerLens}

### 5. What Became Clearer
${summary.whatBecameClearer}

### 6. What I Learned
${summary.whatLearned}

### 7. What I Can Change
${summary.whatCanChange}

### 8. What I Want To Remember
> ${summary.whatToRemember}
    `.trim();

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mantavya-reflection-${reflection.id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back and Action Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reflections</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Takeaway'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
        </div>
      </div>

      {/* Main Structured Document */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-10 shadow-xs">
        {/* Document Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
            <span className="px-2 py-0.5 rounded bg-stone-100 font-semibold">{reflection.mode}</span>
            <span>•</span>
            <span>{new Date(reflection.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-stone-900 tracking-tight">
            {reflection.title || 'Structured Reflection'}
          </h1>
        </div>

        {/* Feature 8: BEFORE / NOW Perspective Shift Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-stone-50 border border-stone-200/80 mb-8">
          <div className="p-4 rounded-lg bg-white border border-stone-200/80">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-stone-400 block mb-1">
              Before Reflecting
            </span>
            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
              {summary.before}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-stone-200/80">
            <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-emerald-700 block mb-1">
              Now (Calibrated Understanding)
            </span>
            <p className="text-stone-900 text-xs sm:text-sm font-medium leading-relaxed">
              {summary.now}
            </p>
          </div>
        </div>

        {/* 8 Structured Pillars */}
        <div className="space-y-6 text-sm text-stone-800">
          {/* 1. What Happened */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                1
              </span>
              <h2>What Happened</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed">
              {summary.whatHappened}
            </p>
          </section>

          {/* 2. What I Initially Thought */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                2
              </span>
              <h2>What I Initially Thought</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed">
              {summary.whatInitiallyThought}
            </p>
          </section>

          {/* 3. What I May Have Assumed */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                3
              </span>
              <h2>What I May Have Assumed</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed">
              {summary.whatMayHaveAssumed}
            </p>
          </section>

          {/* 4. Wider Lens (Observer Perspective) */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                4
              </span>
              <h2>Wider Lens (Outside Observer)</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed font-serif italic text-stone-700">
              &ldquo;{summary.widerLens}&rdquo;
            </p>
          </section>

          {/* 5. What Became Clearer */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                5
              </span>
              <h2>What Became Clearer</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed">
              {summary.whatBecameClearer}
            </p>
          </section>

          {/* 6. What I Learned */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                6
              </span>
              <h2>What I Learned</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed">
              {summary.whatLearned}
            </p>
          </section>

          {/* 7. What I Can Change (Agency) */}
          <section className="pb-5 border-b border-stone-100">
            <div className="flex items-center space-x-2 text-stone-900 font-serif font-medium text-base mb-1.5">
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-mono text-[11px]">
                7
              </span>
              <h2>What I Can Change (Agency)</h2>
            </div>
            <p className="text-stone-600 pl-7 leading-relaxed font-medium text-stone-900">
              {summary.whatCanChange}
            </p>
          </section>

          {/* 8. What I Want To Remember (Core Anchor) */}
          <section className="p-5 rounded-xl bg-stone-900 text-stone-50">
            <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400 block mb-1">
              Takeaway to Remember
            </span>
            <p className="font-serif text-base sm:text-lg italic font-normal leading-relaxed text-stone-100">
              &ldquo;{summary.whatToRemember}&rdquo;
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-stone-200 flex justify-end">
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
          >
            Save & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
