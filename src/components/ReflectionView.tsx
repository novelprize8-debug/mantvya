import React, { useState, useRef, useEffect } from 'react';
import { ReflectionDoc, ReflectionMessage, ReflectionMode, StructuredSummary } from '../types';
import { RealityCheckCard } from './RealityCheckCard';
import { LensesPanel } from './LensesPanel';
import { authenticatedFetch } from '../services/apiClient';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Eye, 
  HelpCircle,
  Clock,
  RotateCcw
} from 'lucide-react';

interface ReflectionViewProps {
  reflection: ReflectionDoc;
  onUpdateReflection: (updated: ReflectionDoc) => Promise<void>;
  onConcludeReflection: (summary: StructuredSummary) => void;
  onBackToDashboard: () => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  reflection,
  onUpdateReflection,
  onConcludeReflection,
  onBackToDashboard,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [reflection.messages, isAiThinking]);

  // If this is a fresh session with only the initial prompt, trigger first AI response
  useEffect(() => {
    if (reflection.messages.length === 1 && reflection.messages[0].role === 'user') {
      sendTurnToGemini(reflection.messages[0].content, reflection.messages);
    }
  }, []);

  const sendTurnToGemini = async (currentInput: string, currentHistory: ReflectionMessage[]) => {
    setIsAiThinking(true);
    setErrorMsg(null);

    try {
      const response = await authenticatedFetch('/api/reflect', {
        method: 'POST',
        body: JSON.stringify({
          mode: reflection.mode,
          messages: currentHistory.map((m) => ({ role: m.role, content: m.content })),
          currentInput,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ReflectionMessage = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: typeof data.reply === 'string' ? data.reply : '',
        timestamp: new Date().toISOString(),
        ...(data.stageLabel ? { stageLabel: data.stageLabel } : {}),
        ...(data.realityCheck ? { realityCheck: data.realityCheck } : {}),
        ...(data.widerLens ? { widerLens: data.widerLens } : {}),
        ...(data.tensionLens ? { tensionLens: data.tensionLens } : {}),
        ...(data.complexityCheck ? { complexityCheck: data.complexityCheck } : {}),
      };

      const updatedMessages = [...currentHistory, aiMessage];

      // Update parent reflection doc, keeping existing lenses if no new ones generated
      const updatedDoc: ReflectionDoc = {
        ...reflection,
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      };

      if (data.realityCheck) {
        updatedDoc.realityCheck = data.realityCheck;
      }
      if (data.widerLens) {
        updatedDoc.widerLens = data.widerLens;
      }
      if (data.tensionLens) {
        updatedDoc.tensionLens = data.tensionLens;
      }
      if (data.complexityCheck) {
        updatedDoc.complexityCheck = data.complexityCheck;
      }

      await onUpdateReflection(updatedDoc);
    } catch (err: any) {
      console.error('Failed to get reflection response:', err);
      setErrorMsg(err.message || 'Unable to connect to reflection reasoning. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isAiThinking || isSummarizing) return;

    setInputText('');
    const userMessage: ReflectionMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...reflection.messages, userMessage];

    // Optimistically update document
    const updatedDoc: ReflectionDoc = {
      ...reflection,
      messages: newHistory,
      updatedAt: new Date().toISOString(),
    };

    try {
      await onUpdateReflection(updatedDoc);
    } catch (err: any) {
      console.error('Failed to save user reflection message:', err);
      setErrorMsg('Could not save your entry to cloud storage. Please check your connection.');
      return;
    }

    // Call server-side Gemini reflection
    await sendTurnToGemini(textToSend, newHistory);
  };

  const handleConcludeReflection = async () => {
    if (reflection.messages.length < 2) {
      setErrorMsg('Please exchange at least one or two turns before concluding your reflection.');
      return;
    }

    setIsSummarizing(true);
    setErrorMsg(null);

    try {
      const response = await authenticatedFetch('/api/summarize', {
        method: 'POST',
        body: JSON.stringify({
          mode: reflection.mode,
          messages: reflection.messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const summary = await response.json();

      const finalDoc: ReflectionDoc = {
        ...reflection,
        title: summary.title || reflection.title,
        status: 'completed',
        structuredSummary: summary,
        updatedAt: new Date().toISOString(),
      };

      await onUpdateReflection(finalDoc);
      onConcludeReflection(summary);
    } catch (err: any) {
      console.error('Error concluding reflection:', err);
      setErrorMsg(err.message || 'Could not conclude reflection. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const lastAiMessage = [...reflection.messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-base sm:text-lg font-medium text-stone-900 line-clamp-1">
                {reflection.title || 'Ongoing Reflection'}
              </span>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                {reflection.mode}
              </span>
            </div>
            {lastAiMessage?.stageLabel && (
              <span className="text-xs text-stone-500 font-mono flex items-center mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />
                Phase: {lastAiMessage.stageLabel}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleConcludeReflection}
          disabled={isSummarizing || isAiThinking || reflection.messages.length < 2}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors text-xs font-medium disabled:opacity-40 cursor-pointer shadow-xs"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conclude & Synthesize</span>
            </>
          )}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-1">
        {reflection.messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-2 text-[11px] text-stone-500 font-mono mb-1.5 px-1">
                <span>{isUser ? 'You' : 'Mantavya'}</span>
                <span>•</span>
                <span>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {!isUser && msg.stageLabel && (
                  <span className="text-amber-800 font-medium">[{msg.stageLabel}]</span>
                )}
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-stone-50 rounded-tr-xs shadow-xs'
                    : 'bg-white border border-stone-200/90 text-stone-900 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-normal">{msg.content}</div>

                {/* Reality Check Card if generated in this turn */}
                {!isUser && msg.realityCheck && (
                  <RealityCheckCard data={msg.realityCheck} />
                )}

                {/* Lenses Panel (Wider Lens / Tension Lens / Complexity Check) */}
                {!isUser && (
                  <LensesPanel
                    widerLens={msg.widerLens}
                    tensionLens={msg.tensionLens}
                    complexityCheck={msg.complexityCheck}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* AI Thinking Indicator */}
        {isAiThinking && (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-mono mb-1 px-1">
              <span>Mantavya is examining...</span>
            </div>
            <div className="bg-stone-100/80 border border-stone-200 rounded-2xl rounded-tl-xs p-4 flex items-center space-x-3 text-stone-600 text-xs sm:text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-stone-700" />
              <span>Examining interpretations, facts, and observer perspective...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2 border-t border-stone-200/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your response, thoughts, or reflections (Enter to send, Shift+Enter for newline)..."
            rows={3}
            disabled={isAiThinking || isSummarizing}
            className="w-full p-4 pr-14 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 text-sm leading-relaxed resize-none shadow-xs disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isAiThinking || isSummarizing}
            className="absolute right-3 bottom-4 p-2 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            title="Send response"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1.5">
          <span>Mantavya challenges interpretations, not your character.</span>
          <span>{reflection.messages.length} exchanges recorded</span>
        </div>
      </div>
    </div>
  );
};
