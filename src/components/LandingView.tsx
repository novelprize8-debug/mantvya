import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, Compass, ArrowRight, Lock, Sparkles } from 'lucide-react';

export const LandingView: React.FC = () => {
  const { signInWithGoogle, loading, authError } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="pt-8 sm:pt-14 pb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium tracking-wide uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-amber-700/80 animate-pulse"></span>
          <span>Google Gen AI Academy APAC Ideathon</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-900 tracking-tight leading-tight mb-6">
          Step outside your thoughts. <br className="hidden sm:inline" />
          <span className="italic font-normal text-stone-600">See the bigger picture.</span>
        </h1>

        <p className="text-stone-600 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-10">
          Mantavya is a private, AI-assisted reflection sanctuary. It does not act as a therapist, coach, or judge—it helps you disentangle observable reality from internal stories, examine assumptions, and act with genuine agency.
        </p>

        {/* Sign In CTA */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="inline-flex items-center justify-center space-x-3 px-7 py-3.5 rounded-xl bg-stone-900 text-stone-50 font-medium text-sm sm:text-base hover:bg-stone-800 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          {authError && (
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-md">
              {authError}
            </p>
          )}

          <div className="flex items-center space-x-2 text-xs text-stone-500 pt-2">
            <Lock className="w-3.5 h-3.5 text-stone-400" />
            <span>Strictly isolated Cloud Firestore • Private by default • No public feeds</span>
          </div>
        </div>
      </div>

      {/* The Triad Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-b border-stone-200">
        <div className="p-6 rounded-xl bg-stone-50/50 border border-stone-200/60">
          <div className="w-8 h-8 rounded-lg bg-stone-200/70 text-stone-800 flex items-center justify-center mb-4 font-mono text-xs font-semibold">
            01
          </div>
          <h3 className="font-serif text-xl text-stone-900 mb-2">Reality</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Separate observable events from the stories, identities, and catastrophic predictions you might be attaching to them.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-stone-50/50 border border-stone-200/60">
          <div className="w-8 h-8 rounded-lg bg-stone-200/70 text-stone-800 flex items-center justify-center mb-4 font-mono text-xs font-semibold">
            02
          </div>
          <h3 className="font-serif text-xl text-stone-900 mb-2">Perspective</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            The Wider Lens: Look through the eyes of an intelligent, fair-minded observer outside your emotional gravity to see what was overlooked.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-stone-50/50 border border-stone-200/60">
          <div className="w-8 h-8 rounded-lg bg-stone-200/70 text-stone-800 flex items-center justify-center mb-4 font-mono text-xs font-semibold">
            03
          </div>
          <h3 className="font-serif text-xl text-stone-900 mb-2">Agency</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Distinguish between what you control and what you do not. Decide what would genuinely be in your best interest next.
          </p>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="py-10 text-center max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-stone-400 font-medium mb-2">
          Core Operating Principle
        </p>
        <blockquote className="font-serif italic text-xl text-stone-800 mb-3">
          &ldquo;Challenge the interpretation, not the person.&rdquo;
        </blockquote>
        <p className="text-xs text-stone-500 leading-relaxed">
          Honesty without humiliation. Warmth without empty reassurance. A space to calibrate thinking, not to collect hollow praise.
        </p>
      </div>
    </div>
  );
};
