import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { ReflectionView } from './components/ReflectionView';
import { StructuredReflectionView } from './components/StructuredReflectionView';
import { HistoryView } from './components/HistoryView';
import { ReflectionDoc, ReflectionMode, StructuredSummary } from './types';
import { 
  subscribeToUserReflections, 
  saveReflectionDoc, 
  deleteReflectionDoc 
} from './services/reflections';
import { ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'reflection' | 'history' | 'summary'>('dashboard');
  const [activeReflection, setActiveReflection] = useState<ReflectionDoc | null>(null);
  const [reflections, setReflections] = useState<ReflectionDoc[]>([]);
  const [loadingReflections, setLoadingReflections] = useState<boolean>(true);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  // Subscribe to user's private reflections in Cloud Firestore
  useEffect(() => {
    if (!user) {
      setReflections([]);
      setLoadingReflections(false);
      return;
    }

    setLoadingReflections(true);
    const unsubscribe = subscribeToUserReflections(
      user.uid,
      (docs) => {
        setReflections(docs);
        setLoadingReflections(false);
      },
      (error) => {
        console.error('Failed to subscribe to reflections:', error);
        setLoadingReflections(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleStartReflection = async (mode: ReflectionMode, initialText: string) => {
    if (!user) return;

    const newReflection: ReflectionDoc = {
      id: 'ref_' + Date.now(),
      userId: user.uid,
      title: initialText.slice(0, 50) + (initialText.length > 50 ? '...' : ''),
      mode,
      status: 'active',
      initialPrompt: initialText,
      messages: [
        {
          id: 'msg_' + Date.now(),
          role: 'user',
          content: initialText,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setActiveReflection(newReflection);
    setCurrentView('reflection');

    // Save to Firestore with error handling
    try {
      setPersistenceError(null);
      await saveReflectionDoc(user.uid, newReflection);
    } catch (err) {
      console.error('Failed to save new reflection to Firestore:', err);
      setPersistenceError('Unable to sync reflection to cloud storage. Please check your connection.');
    }
  };

  const handleOpenReflection = (reflection: ReflectionDoc) => {
    setActiveReflection(reflection);
    if (reflection.status === 'completed' && reflection.structuredSummary) {
      setCurrentView('summary');
    } else {
      setCurrentView('reflection');
    }
  };

  const handleDeleteReflection = async (id: string) => {
    if (!user) return;
    try {
      setPersistenceError(null);
      await deleteReflectionDoc(user.uid, id);
      if (activeReflection?.id === id) {
        setActiveReflection(null);
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Failed to delete reflection:', err);
      setPersistenceError('Failed to delete reflection from cloud storage.');
    }
  };

  const handleUpdateReflection = async (updated: ReflectionDoc) => {
    if (!user) return;
    setActiveReflection(updated);
    try {
      setPersistenceError(null);
      await saveReflectionDoc(user.uid, updated);
    } catch (err) {
      console.error('Failed to update reflection in Firestore:', err);
      setPersistenceError('Failed to sync changes to cloud storage.');
      throw err;
    }
  };

  const handleConcludeReflection = (summary: StructuredSummary) => {
    if (activeReflection) {
      setActiveReflection({
        ...activeReflection,
        status: 'completed',
        structuredSummary: summary,
      });
    }
    setCurrentView('summary');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-xl font-semibold mb-4 animate-pulse">
          म
        </div>
        <p className="font-serif text-stone-700 text-sm">Opening Mantavya space...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 flex flex-col selection:bg-stone-200 selection:text-stone-900">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard') {
            setActiveReflection(null);
          }
          setCurrentView(view);
        }}
        onNewReflection={() => {
          setActiveReflection(null);
          setCurrentView('dashboard');
        }}
        isReflecting={currentView === 'reflection'}
      />

      {persistenceError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>{persistenceError}</span>
          </div>
          <button
            onClick={() => setPersistenceError(null)}
            className="text-amber-800 hover:text-amber-950 font-medium underline text-xs cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1">
        {!user ? (
          <LandingView />
        ) : currentView === 'reflection' && activeReflection ? (
          <ReflectionView
            reflection={activeReflection}
            onUpdateReflection={handleUpdateReflection}
            onConcludeReflection={handleConcludeReflection}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'summary' && activeReflection ? (
          <StructuredReflectionView
            reflection={activeReflection}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : currentView === 'history' ? (
          <HistoryView
            reflections={reflections}
            onOpenReflection={handleOpenReflection}
            onDeleteReflection={handleDeleteReflection}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <DashboardView
            onStartReflection={handleStartReflection}
            onOpenReflection={handleOpenReflection}
            onDeleteReflection={handleDeleteReflection}
            reflections={reflections}
            loadingReflections={loadingReflections}
          />
        )}
      </main>

      {/* Subtle, Scholarly Footer */}
      <footer className="border-t border-stone-200/80 bg-stone-50/50 py-6 text-center text-xs text-stone-500 font-sans">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-medium text-stone-800">Mantavya</span>
            <span>•</span>
            <span>Google Gen AI Academy APAC Edition</span>
          </div>
          <div className="flex items-center space-x-1.5 text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Zero-Trust Firestore Security • Server-Side Gemini 3.8</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
