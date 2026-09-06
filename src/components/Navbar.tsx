import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, BookOpen, PlusCircle, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'reflection' | 'history' | 'summary';
  onNavigate: (view: 'dashboard' | 'history') => void;
  onNewReflection: () => void;
  isReflecting?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onNewReflection,
  isReflecting,
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-lg font-semibold tracking-wider shadow-xs">
            म
          </div>
          <div>
            <span className="font-serif text-xl tracking-tight text-stone-900 font-medium">
              Mantavya
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-widest text-stone-500 font-sans font-medium">
              Private AI Reflection
            </span>
          </div>
        </div>

        {/* Navigation & Actions */}
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onNewReflection}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors shadow-xs"
              title="Begin a new reflection"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Reflection</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-stone-200/70 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              Reflect
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'history'
                  ? 'bg-stone-200/70 text-stone-900'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              <span>Archive</span>
            </button>

            <div className="h-4 w-px bg-stone-200 mx-1 hidden sm:block" />

            {/* User Profile & Sign Out */}
            <div className="flex items-center space-x-2.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-stone-300 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs text-stone-600 hidden md:inline truncate max-w-[120px]">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors"
                title="Sign out of Mantavya"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
