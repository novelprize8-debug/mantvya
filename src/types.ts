export type ReflectionMode = 'understand' | 'reality-check' | 'decision' | 'learn' | 'process';

export interface RealityCheckBreakdown {
  facts: string[];
  interpretations: string[];
  assumptions: string[];
  withinControl: string[];
  outsideControl: string[];
}

export interface ReflectionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  stageLabel?: string;
  realityCheck?: RealityCheckBreakdown | null;
  widerLens?: string | null;
  tensionLens?: string | null;
  complexityCheck?: string | null;
  agencyPrompt?: string | null;
}

export interface StructuredSummary {
  title?: string;
  whatHappened: string;
  whatInitiallyThought: string;
  whatMayHaveAssumed: string;
  widerLens: string;
  whatBecameClearer: string;
  whatLearned: string;
  whatCanChange: string;
  whatToRemember: string;
  before: string;
  now: string;
}

export interface ReflectionDoc {
  id: string;
  userId: string;
  title: string;
  mode: ReflectionMode;
  status: 'active' | 'completed';
  initialPrompt?: string;
  messages: ReflectionMessage[];
  realityCheck?: RealityCheckBreakdown | null;
  widerLens?: string | null;
  tensionLens?: string | null;
  complexityCheck?: string | null;
  structuredSummary?: StructuredSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
